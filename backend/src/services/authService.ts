import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidPhone } from "../utils/validators";
import { isValidEmail } from "../utils/validators";
import { sendEmail } from "./mailer";
import { sendSms } from "./sms";
const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export async function registerUser(email: string, password: string, name?: string, phone?: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw Object.assign(new Error("User already exists. Please login."), { status: 400 });
  if (phone && !isValidPhone(phone)) {
    throw Object.assign(new Error("Invalid mobile number"), { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  let user: any;
  let otpSent = false;
  try {
    user = await prisma.user.create({ data: { email, password: hash, name, phone, phoneVerified: false } });
    await createPhoneOtp(user.id);
    otpSent = true;
    return { user, otpSent };
  } catch (e: any) {
    user = await prisma.user.create({ data: { email, password: hash, name } });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, password: true } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

async function findUserByIdentifier(identifier: string) {
  const id = String(identifier).trim();
  if (isValidEmail(id)) {
    return prisma.user.findUnique({ where: { email: id }, select: { id: true, email: true, password: true } });
  }
  if (isValidPhone(id)) {
    try {
      return await prisma.user.findUnique({ where: { phone: id }, select: { id: true, email: true, password: true } });
    } catch (e: any) {
      throw Object.assign(new Error("Phone login unavailable until database migration is applied"), { status: 503 });
    }
  }
  throw Object.assign(new Error("Invalid login identifier"), { status: 400 });
}

export async function loginByIdentifier(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

export async function sendLoginOtp(identifier: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  try {
    await prisma.verificationCode.create({ data: { userId: user.id, type: "LOGIN", code, expiresAt } });
  } catch (e: any) {
    throw Object.assign(new Error("Login OTP unavailable until database migration is applied"), { status: 503 });
  }
  console.log(`[LOGIN-OTP] Code for ${identifier}: ${code}`);
  try {
    const u = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, phone: true } });
    if (u?.phone) {
      try { await sendSms(u.phone, `Your FlyFast login code is ${code}`); } catch {}
    }
    if (u?.email) {
      try { await sendEmail(u.email, "Your login code", `Your code is ${code}`); } catch {}
    }
  } catch {}
  return { otpSent: true };
}

export async function verifyLoginOtp(identifier: string, code: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, type: "LOGIN", code, used: false },
    orderBy: { createdAt: "desc" }
  });
  if (!record) throw Object.assign(new Error("Invalid OTP"), { status: 400 });
  if (record.expiresAt.getTime() < Date.now()) throw Object.assign(new Error("OTP expired"), { status: 400 });
  await prisma.$transaction([
    prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } })
  ]);
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { verified: true, token };
}

function genCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

async function createPhoneOtp(userId: string) {
  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationCode.create({
    data: { userId, type: "PHONE", code, expiresAt }
  });
  console.log(`[OTP] Sent phone OTP to user ${userId}: ${code}`);
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
    if (u?.phone) {
      try { await sendSms(u.phone, `Your FlyFast code is ${code}`); } catch {}
    }
    if (u?.email) {
      try { await sendEmail(u.email, "Your verification code", `Your code is ${code}`); } catch {}
    }
  } catch {}
}

export async function sendOtpToPhoneByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  await createPhoneOtp(user.id);
  return { otpSent: true };
}

export async function verifyPhoneOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, type: "PHONE", code, used: false },
    orderBy: { createdAt: "desc" }
  });
  if (!record) throw Object.assign(new Error("Invalid OTP"), { status: 400 });
  if (record.expiresAt.getTime() < Date.now()) throw Object.assign(new Error("OTP expired"), { status: 400 });
  await prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } });
  await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { verified: true, token };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };
  const code = genCode(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.verificationCode.create({ data: { userId: user.id, type: "RESET", code, expiresAt } });
  console.log(`[RESET] Password reset code for ${email}: ${code}`);
  try { await sendEmail(email, "Password reset code", `Your code is ${code}`); } catch {}
  return { ok: true };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, type: "RESET", code, used: false },
    orderBy: { createdAt: "desc" }
  });
  if (!record) throw Object.assign(new Error("Invalid reset code"), { status: 400 });
  if (record.expiresAt.getTime() < Date.now()) throw Object.assign(new Error("Reset code expired"), { status: 400 });
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } }),
    prisma.user.update({ where: { id: user.id }, data: { password: hash } })
  ]);
  return { ok: true };
}
