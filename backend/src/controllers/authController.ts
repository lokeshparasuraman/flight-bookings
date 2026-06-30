import { Router } from "express";
import * as authService from "../services/authService";
import { body, validationResult } from "express-validator";
import { isValidPhone } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middlewares/authMiddleWare";

const router = Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("phone").optional().custom((v) => !v || isValidPhone(v)),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { email, password, name, phone } = req.body;
      const { user, otpSent } = await authService.registerUser(email, password, name, phone);
      res.json({ user, otpSent });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login",
  body("identifier").optional().isString(),
  body("email").optional().isEmail(),
  body("password").isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { identifier, email, password } = req.body;
      const id = identifier || email;
      const { user, token } = await authService.loginByIdentifier(id, password);
      res.json({ user, token });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/send-otp",
  body("email").isEmail(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { email } = req.body;
      const r = await authService.sendOtpToPhoneByEmail(email);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/verify-otp",
  body("email").isEmail(),
  body("code").isLength({ min: 4, max: 8 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { email, code } = req.body;
      const r = await authService.verifyPhoneOtp(email, code);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/forgot",
  body("identifier").isString(),
  body("channel").optional().isIn(["email", "phone"]),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { identifier, channel } = req.body as { identifier: string; channel?: "email" | "phone" };
      const r = await authService.requestPasswordReset(identifier, channel);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/reset",
  body("identifier").isString(),
  body("code").isLength({ min: 4, max: 8 }),
  body("newPassword").isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { identifier, code, newPassword } = req.body as { identifier: string; code: string; newPassword: string };
      const r = await authService.resetPassword(identifier, code, newPassword);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

router.post("/dev/otp/latest", async (req, res, next) => {
  try {
    const { identifier, type } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const record = await prisma.verificationCode.findFirst({
      where: { userId: user.id, type: type || "PHONE" },
      orderBy: { createdAt: "desc" }
    });
    if (!record) return res.status(404).json({ error: "No OTP found" });
    res.json({ code: record.code });
  } catch (e) {
    next(e);
  }
});

export default router;
router.post(
  "/login-otp/send",
  body("identifier").isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { identifier } = req.body;
      const r = await authService.sendLoginOtp(identifier);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login-otp/verify",
  body("identifier").isString(),
  body("code").isLength({ min: 4, max: 8 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    try {
      const { identifier, code } = req.body;
      const r = await authService.verifyLoginOtp(identifier, code);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

// Delete my passenger account
router.delete(
  "/me",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId as string;
      await authService.deleteUserAccount(userId);
      res.json({ success: true, message: "User account successfully deleted" });
    } catch (e) {
      next(e);
    }
  }
);
