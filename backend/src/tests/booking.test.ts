import request from "supertest";
import { app } from "../server";
import { prisma } from "../db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-own-string";

describe("Booking and Payments API Endpoints", () => {
  let userToken: string;
  let userId: string;
  let flightId: string;

  beforeEach(async () => {
    // Clean tables
    await prisma.verificationCode.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.user.deleteMany();

    // Create a dummy user and login to get JWT token
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: "passenger@example.com",
        password: "password123",
        name: "Lokesh Parasuraman",
      });
    
    userId = regRes.body.user.id;
    userToken = jwt.sign({ sub: userId, email: "passenger@example.com" }, JWT_SECRET, { expiresIn: "1h" });

    // Seed a flight
    const flight = await prisma.flight.create({
      data: {
        origin: "DEL",
        destination: "BOM",
        airline: "Vistara",
        flightNumber: "UK-981",
        departure: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        arrival: new Date(Date.now() + 26 * 60 * 60 * 1000),
        basePriceCents: 600000
      }
    });
    flightId = flight.id;
  });

  describe("POST /api/bookings", () => {
    it("should reject booking creation if unauthenticated", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({ flightId });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token");
    });

    it("should create a PENDING booking when authenticated", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          flightId,
          seatNumber: "3A",
          passengerNames: "Lokesh Parasuraman",
          luggageOption: "15kg (Included)",
          totalPriceCents: 608000
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("status", "PENDING");
      expect(res.body).toHaveProperty("priceCents", 608000);
      expect(res.body).toHaveProperty("seatNumber", "3A");
    });

    it("should return 404 if the flight is not found", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ flightId: "00000000-0000-0000-0000-000000000000" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Flight not found");
    });
  });

  describe("POST /api/bookings/:id/pay", () => {
    let bookingId: string;

    beforeEach(async () => {
      // Create a pending booking
      const b = await prisma.booking.create({
        data: {
          userId,
          flightId,
          status: "PENDING",
          priceCents: 608000,
          seatNumber: "3A",
          passengerNames: "Lokesh Parasuraman"
        }
      });
      bookingId = b.id;
    });

    it("should process UPI payment and confirm booking", async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/pay`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          method: "UPI",
          upiId: "passenger@okaxis"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "CONFIRMED");

      // Verify payment was recorded in database
      const payment = await prisma.payment.findFirst({
        where: { bookingId }
      });
      expect(payment).not.toBeNull();
      expect(payment?.status).toBe("SUCCESS");
      expect(payment?.method).toBe("UPI");
      expect(payment?.upiId).toBe("passenger@okaxis");
      expect(payment?.amountCents).toBe(608000);
    });

    it("should reject UPI payment if format is invalid", async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/pay`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          method: "UPI",
          upiId: "invalid-upi-id"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid UPI ID");
    });

    it("should process CARD payment and confirm booking", async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/pay`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          method: "CARD",
          cardNumber: "4111 2222 3333 4444",
          cardBrand: "VISA"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "CONFIRMED");

      const payment = await prisma.payment.findFirst({
        where: { bookingId }
      });
      expect(payment?.status).toBe("SUCCESS");
      expect(payment?.method).toBe("CARD");
      expect(payment?.cardLast4).toBe("4444");
      expect(payment?.cardBrand).toBe("VISA");
    });
  });

  describe("DELETE /api/bookings/:id (Cancel and Refund)", () => {
    it("should cancel confirmed booking and insert a REFUNDED payment record", async () => {
      // Create confirmed booking with successful payment
      const booking = await prisma.booking.create({
        data: {
          userId,
          flightId,
          status: "CONFIRMED",
          priceCents: 608000,
          seatNumber: "3A",
          passengerNames: "Lokesh Parasuraman"
        }
      });
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: "UPI",
          amountCents: 608000,
          status: "SUCCESS",
          upiId: "passenger@okaxis"
        }
      });

      const res = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok", true);

      // Verify booking status is CANCELLED in DB
      const bUpdated = await prisma.booking.findUnique({ where: { id: booking.id } });
      expect(bUpdated?.status).toBe("CANCELLED");

      // Verify that a REFUNDED payment entry is added
      const refundPayment = await prisma.payment.findFirst({
        where: { bookingId: booking.id, status: "REFUNDED" }
      });
      expect(refundPayment).not.toBeNull();
      expect(refundPayment?.amountCents).toBe(608000);
    });
  });
});
