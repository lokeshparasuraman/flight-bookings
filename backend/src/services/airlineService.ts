import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidateRoutesCache } from "./flightService";

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export async function registerAirline(name: string, email: string, password: string) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const existingName = await prisma.airline.findUnique({ where: { name: cleanName } });
  if (existingName) {
    throw Object.assign(new Error("Airline brand name is already registered"), { status: 400 });
  }

  const existingEmail = await prisma.airline.findUnique({ where: { email: cleanEmail } });
  if (existingEmail) {
    throw Object.assign(new Error("Email address is already in use by another airline"), { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const airline = await prisma.airline.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      password: hash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  const token = jwt.sign({ sub: airline.id, email: airline.email, role: "AIRLINE" }, JWT_SECRET, { expiresIn: "7d" });
  return { airline, token };
}

export async function loginAirline(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  const airline = await prisma.airline.findUnique({
    where: { email: cleanEmail }
  });

  if (!airline) {
    throw Object.assign(new Error("Invalid airline credentials"), { status: 401 });
  }

  const matches = await bcrypt.compare(password, airline.password);
  if (!matches) {
    throw Object.assign(new Error("Invalid airline credentials"), { status: 401 });
  }

  const token = jwt.sign({ sub: airline.id, email: airline.email, role: "AIRLINE" }, JWT_SECRET, { expiresIn: "7d" });
  return {
    airline: {
      id: airline.id,
      name: airline.name,
      email: airline.email,
      createdAt: airline.createdAt
    },
    token
  };
}

export async function createAirlineFlight(
  airlineId: string,
  payload: {
    origin: string;
    destination: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    basePriceCents: number;
  }
) {
  const airline = await prisma.airline.findUnique({ where: { id: airlineId } });
  if (!airline) {
    throw Object.assign(new Error("Airline not found"), { status: 404 });
  }

  const flight = await prisma.flight.create({
    data: {
      origin: payload.origin.trim().toUpperCase(),
      destination: payload.destination.trim().toUpperCase(),
      airline: airline.name,
      flightNumber: payload.flightNumber.trim().toUpperCase(),
      departure: new Date(payload.departure),
      arrival: new Date(payload.arrival),
      basePriceCents: payload.basePriceCents,
      registeredAirlineId: airlineId
    }
  });

  invalidateRoutesCache();
  return flight;
}

export async function getAirlineFlights(airlineId: string) {
  return prisma.flight.findMany({
    where: { registeredAirlineId: airlineId },
    orderBy: { departure: "asc" }
  });
}

export async function getAirlineBookings(airlineId: string) {
  // Find all flights registered by this airline
  const flights = await prisma.flight.findMany({
    where: { registeredAirlineId: airlineId },
    select: { id: true }
  });

  const flightIds = flights.map(f => f.id);

  // Find all bookings for those flights
  return prisma.booking.findMany({
    where: { flightId: { in: flightIds } },
    include: {
      flight: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
