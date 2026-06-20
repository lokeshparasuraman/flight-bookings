import { Router } from "express";
import { requireAuth, AuthRequest } from "../middlewares/authMiddleWare";
import * as bookingService from "../services/bookingService";

const router = Router();

// create booking
router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { flightId, seatNumber, luggageOption, mealOption, wifiOption, insuranceOption, totalPriceCents } = req.body;
    if (typeof flightId !== "string" || !flightId.trim()) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const userId = req.userId as string;
    const booking = await bookingService.createBooking(userId, flightId, {
      seatNumber,
      luggageOption,
      mealOption,
      wifiOption,
      insuranceOption,
      totalPriceCents
    });
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// confirm booking (admin / user flow) - keeping as user action
router.post("/:id/confirm", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const userId = req.userId as string;
    const booking = await bookingService.confirmBooking(userId, id);
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// get my bookings
router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

// pay for booking
router.post("/:id/pay", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    const { method, upiId, cardNumber, cardBrand } = req.body;
    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ error: "Invalid input" });
    }
    if (typeof method !== "string" || !["UPI", "CARD"].includes(method)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    if (method === "CARD" && (!cardNumber || !cardBrand)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const userId = req.userId as string;
    const booking = await bookingService.payForBooking(userId, id, { method, upiId, cardNumber, cardBrand });
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// cancel & refund
router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const userId = req.userId as string;
    const resp = await bookingService.cancelAndRefund(userId, id);
    res.json(resp);
  } catch (e) {
    next(e);
  }
});

export default router;
