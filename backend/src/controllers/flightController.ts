import { Router } from "express";
import * as flightService from "../services/flightService";

const router = Router();

router.get("/search", async (req, res, next) => {
  try {
    const { origin, destination, date } = req.query;
    if (!origin || !destination) return res.status(400).json({ error: "origin & destination required" });
    const flights = await flightService.searchFlights(String(origin), String(destination), date ? String(date) : undefined);
    res.json(flights);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    res.json(flight);
  } catch (e) {
    next(e);
  }
});

export default router;
