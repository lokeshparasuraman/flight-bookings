import request from "supertest";
import { app } from "../server";
import { prisma } from "../db";

describe("Authentication API Endpoints", () => {
  const testEmail = "testuser@example.com";
  const testPassword = "password123";
  const testName = "Test User";
  const testPhone = "+919876543210";

  beforeEach(async () => {
    // Clear test tables to isolate tests
    await prisma.verificationCode.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully without phone", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testEmail);
      expect(res.body.user).toHaveProperty("name", testName);
      expect(res.body.user.phone).toBeNull();
      expect(res.body).toHaveProperty("otpSent", false);
    });

    it("should trigger OTP flow when registering with a phone number", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          phone: testPhone,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("otpSent", true);
      expect(res.body.user).toHaveProperty("phone", testPhone);

      // Verify OTP record exists in DB
      const codeRecord = await prisma.verificationCode.findFirst({
        where: { userId: res.body.user.id, type: "PHONE" }
      });
      expect(codeRecord).not.toBeNull();
      expect(codeRecord?.code).toHaveLength(6);
    });

    it("should prevent duplicate registration with the same email", async () => {
      // Register first user
      await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
        });

      // Try registering again
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: "anotherpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "User already exists. Please login.");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Pre-register user for login tests
      await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          phone: testPhone,
        });
    });

    it("should login successfully with email and password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testEmail);
    });

    it("should login successfully with identifier (phone) and password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          identifier: testPhone,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testEmail);
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid password");
    });
  });

  describe("OTP Verification and Reset Flow", () => {
    it("should verify phone OTP code successfully", async () => {
      // Register with phone
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          phone: testPhone,
        });

      const userId = regRes.body.user.id;
      const codeRecord = await prisma.verificationCode.findFirst({
        where: { userId, type: "PHONE" }
      });
      const code = codeRecord!.code;

      // Verify OTP
      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          email: testEmail,
          code: code
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body).toHaveProperty("verified", true);

      // Verify user phone is marked verified in DB
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.phoneVerified).toBe(true);
    });
  });
});
