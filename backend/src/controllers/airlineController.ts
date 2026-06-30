import { Router } from "express";
import { body, validationResult } from "express-validator";
import * as airlineService from "../services/airlineService";
import { requireAirlineAuth, AuthRequest } from "../middlewares/authMiddleWare";

const router = Router();

// ----------------- AIRLINE REGISTRATION & LOGIN -----------------

router.post(
  "/register",
  body("name").isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input values", details: errors.array() });
    try {
      const { name, email, password } = req.body;
      const result = await airlineService.registerAirline(name, email, password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input values", details: errors.array() });
    try {
      const { email, password } = req.body;
      const result = await airlineService.loginAirline(email, password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

// ----------------- AIRLINE CONSOLE MODULES -----------------

// Create new flight route
router.post(
  "/flights",
  requireAirlineAuth,
  body("origin").isLength({ min: 3, max: 3 }),
  body("destination").isLength({ min: 3, max: 3 }),
  body("flightNumber").isLength({ min: 2 }),
  body("departure").isISO8601(),
  body("arrival").isISO8601(),
  body("basePriceCents").isInt({ min: 100 }),
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid flight parameters", details: errors.array() });
    try {
      const airlineId = req.airlineId as string;
      const { origin, destination, flightNumber, departure, arrival, basePriceCents } = req.body;
      const flight = await airlineService.createAirlineFlight(airlineId, {
        origin,
        destination,
        flightNumber,
        departure,
        arrival,
        basePriceCents
      });
      res.json(flight);
    } catch (e) {
      next(e);
    }
  }
);

// List created flights
router.get(
  "/flights",
  requireAirlineAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const airlineId = req.airlineId as string;
      const flights = await airlineService.getAirlineFlights(airlineId);
      res.json(flights);
    } catch (e) {
      next(e);
    }
  }
);

// Get bookings for my flights
router.get(
  "/bookings",
  requireAirlineAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const airlineId = req.airlineId as string;
      const bookings = await airlineService.getAirlineBookings(airlineId);
      res.json(bookings);
    } catch (e) {
      next(e);
    }
  }
);

// Update a flight route
router.put(
  "/flights/:id",
  requireAirlineAuth,
  body("origin").isLength({ min: 3, max: 100 }),
  body("destination").isLength({ min: 3, max: 100 }),
  body("flightNumber").isLength({ min: 2 }),
  body("departure").isISO8601(),
  body("arrival").isISO8601(),
  body("basePriceCents").isInt({ min: 100 }),
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid flight parameters", details: errors.array() });
    try {
      const airlineId = req.airlineId as string;
      const flightId = req.params.id;
      const { origin, destination, flightNumber, departure, arrival, basePriceCents } = req.body;
      const flight = await airlineService.updateAirlineFlight(airlineId, flightId, {
        origin,
        destination,
        flightNumber,
        departure,
        arrival,
        basePriceCents
      });
      res.json(flight);
    } catch (e) {
      next(e);
    }
  }
);

// Delete a flight route
router.delete(
  "/flights/:id",
  requireAirlineAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const airlineId = req.airlineId as string;
      const flightId = req.params.id;
      await airlineService.deleteAirlineFlight(airlineId, flightId);
      res.json({ success: true, message: "Flight successfully deleted" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
