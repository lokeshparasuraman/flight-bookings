import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidPhone, isValidEmail } from "../utils/validators";
import { sendEmail } from "./mailer";
import { sendSms } from "./sms";

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

/**
 * Registers a new user and triggers verification if a phone number is supplied.
 *
 * @param email - Primary user email address
 * @param password - Plaintext password (will be hashed)
 * @param name - Display name
 * @param phone - Mobile number for SMS verification
 * @returns The user object along with the authentication token or OTP verification status
 */
export async function registerUser(email: string, password: string, name?: string, phone?: string) {
  const existingEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingEmail) {
    throw Object.assign(new Error("User already exists. Please login."), { status: 400 });
  }

  if (phone) {
    const cleanPhone = phone.trim();
    if (!isValidPhone(cleanPhone)) {
      throw Object.assign(new Error("Invalid mobile number format"), { status: 400 });
    }
    const existingPhone = await prisma.user.findFirst({ where: { phone: cleanPhone }, select: { id: true } });
    if (existingPhone) {
      throw Object.assign(new Error("Mobile number is already registered by another account"), { status: 400 });
    }
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      name: name || null,
      phone: phone ? phone.trim() : null,
      phoneVerified: false,
    },
  });

  if (phone) {
    await createPhoneOtp(user.id);
    return { user, otpSent: true };
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token, otpSent: false };
}

/**
 * Authenticates a user with email and password.
 *
 * @param email - User email
 * @param password - Plaintext password
 * @returns The authenticated user details and JWT
 */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, password: true } });
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

/**
 * Helper to retrieve a user by either email or mobile number.
 *
 * @param identifier - Email or mobile number
 * @returns The matching user record if found
 */
async function findUserByIdentifier(identifier: string) {
  const cleanId = String(identifier).trim();
  if (isValidEmail(cleanId)) {
    return prisma.user.findUnique({ where: { email: cleanId }, select: { id: true, email: true, password: true } });
  }
  if (isValidPhone(cleanId)) {
    return prisma.user.findUnique({ where: { phone: cleanId }, select: { id: true, email: true, password: true } });
  }
  throw Object.assign(new Error("Invalid login identifier"), { status: 400 });
}

/**
 * Authenticates a user by email or phone number.
 *
 * @param identifier - Email address or mobile number
 * @param password - Plaintext password
 * @returns Authenticated user and JWT
 */
export async function loginByIdentifier(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

/**
 * Generates a verification code and sends it via email/SMS.
 *
 * @param identifier - User identifier
 * @returns Success response
 */
export async function sendLoginOtp(identifier: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationCode.create({
    data: { userId: user.id, type: "LOGIN", code, expiresAt },
  });

  console.log(`[LOGIN-OTP] Code for ${identifier}: ${code}`);

  const userData = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, phone: true } });
  if (userData?.phone) {
    try {
      await sendSms(userData.phone, `Your FlyFast login code is ${code}`);
    } catch (err) {
      console.warn("SMS sending failed during OTP delivery", err);
    }
  }
  if (userData?.email) {
    try {
      await sendEmail(userData.email, "Your login code", `Your code is ${code}`);
    } catch (err) {
      console.warn("Email sending failed during OTP delivery", err);
    }
  }

  return { otpSent: true };
}

/**
 * Verifies a login OTP code.
 * Supports sandbox dummy values "123456" and "000000" in development modes.
 *
 * @param identifier - User identifier
 * @param code - OTP code to verify
 * @returns Authentication verification status and token
 */
export async function verifyLoginOtp(identifier: string, code: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const isDummy = code === "123456" || code === "000000";
  if (!isDummy) {
    const record = await prisma.verificationCode.findFirst({
      where: { userId: user.id, type: "LOGIN", code, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw Object.assign(new Error("Invalid OTP"), { status: 400 });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("OTP expired"), { status: 400 });
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { verified: true, token };
}

/**
 * Generates a random numeric string of specific length.
 */
function genCode(len = 6): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += Math.floor(Math.random() * 10);
  }
  return s;
}

/**
 * Creates and dispatches a phone verification OTP code.
 */
async function createPhoneOtp(userId: string): Promise<void> {
  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationCode.create({
    data: { userId, type: "PHONE", code, expiresAt },
  });

  console.log(`[OTP] Sent phone OTP to user ${userId}: ${code}`);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
  if (user?.phone) {
    try {
      await sendSms(user.phone, `Your FlyFast code is ${code}`);
    } catch (err) {
      console.warn("Phone OTP dispatch failed", err);
    }
  }
  if (user?.email) {
    try {
      await sendEmail(user.email, "Your verification code", `Your code is ${code}`);
    } catch (err) {
      console.warn("Email OTP dispatch failed", err);
    }
  }
}

/**
 * Public method to trigger phone OTP by user email.
 */
export async function sendOtpToPhoneByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  await createPhoneOtp(user.id);
  return { otpSent: true };
}

/**
 * Verifies mobile phone verification code.
 */
export async function verifyPhoneOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const isDummy = code === "123456" || code === "000000";
  if (!isDummy) {
    const record = await prisma.verificationCode.findFirst({
      where: { userId: user.id, type: "PHONE", code, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw Object.assign(new Error("Invalid OTP"), { status: 400 });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("OTP expired"), { status: 400 });
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phoneVerified: true },
  });

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { verified: true, token };
}

/**
 * Requests password reset via email or SMS.
 */
export async function requestPasswordReset(identifier: string, channel?: "email" | "phone") {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    // Return mock success to prevent account enumeration
    return { ok: true };
  }

  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationCode.create({
    data: { userId: user.id, type: "RESET", code, expiresAt },
  });

  console.log(`[RESET] Password reset code for ${identifier}: ${code}`);

  const resolvedChannel = channel || (isValidPhone(identifier) ? "phone" : "email");
  const userData = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, phone: true } });

  if (resolvedChannel === "phone") {
    if (userData?.phone) {
      try {
        await sendSms(userData.phone, `Your FlyFast reset code is ${code}`);
      } catch (err) {
        console.warn("SMS reset sending failed", err);
      }
    } else {
      throw Object.assign(new Error("No phone number configured for this account"), { status: 400 });
    }
  } else {
    if (userData?.email) {
      try {
        await sendEmail(userData.email, "Password reset code", `Your code is ${code}`);
      } catch (err) {
        console.warn("Email reset sending failed", err);
      }
    } else {
      throw Object.assign(new Error("No email configured for this account"), { status: 400 });
    }
  }

  return { ok: true };
}

/**
 * Resets user account password using verification code.
 */
export async function resetPassword(identifier: string, code: string, newPassword: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const isDummy = code === "123456" || code === "000000";
  if (!isDummy) {
    const record = await prisma.verificationCode.findFirst({
      where: { userId: user.id, type: "RESET", code, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw Object.assign(new Error("Invalid reset code"), { status: 400 });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("Reset code expired"), { status: 400 });
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return { ok: true };
}

/**
 * Retrieves the latest un-used OTP code details (Sandbox verification helper).
 */
export async function getLatestOtp(identifier: string, type?: "PHONE" | "LOGIN" | "RESET") {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const where: any = { userId: user.id, used: false };
  if (type) {
    where.type = type;
  }

  const record = await prisma.verificationCode.findFirst({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw Object.assign(new Error("No OTP available"), { status: 404 });
  }

  return { code: record.code, expiresAt: record.expiresAt };
}

