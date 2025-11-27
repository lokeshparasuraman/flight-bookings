import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleWare";
import * as bookingService from "../services/bookingService";

const router = Router();

router.post("/", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.userId as string;
    const { flightId } = req.body;
    const booking = await bookingService.createBooking(userId, flightId);
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/confirm", requireAuth, async (req: any, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(req.params.id);
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.userId as string;
    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/pay", requireAuth, async (req: any, res, next) => {
  try {
    const id = req.params.id as string;
    const { method, upiId, cardNumber, cardBrand } = req.body;
    const booking = await bookingService.payForBooking(id, { method, upiId, cardNumber, cardBrand });
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req: any, res, next) => {
  try {
    const id = req.params.id as string;
    const resp = await bookingService.cancelAndRefund(id);
    res.json(resp);
  } catch (e) {
    next(e);
  }
});

export default router;
