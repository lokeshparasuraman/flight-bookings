import { Router } from "express";
import authController from "./controllers/authController";
import flightController from "./controllers/flightController";
import bookingsController from "./controllers/bookingsController";
import chatController from "./controllers/chatController";

const router = Router();
router.use("/auth", authController);
router.use("/flights", flightController);
router.use("/bookings", bookingsController);
router.use("/chat", chatController);

export default router;
