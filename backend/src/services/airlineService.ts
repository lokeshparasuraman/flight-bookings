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

  const registeredAirlines = await prisma.airline.findMany({
    select: { name: true, email: true }
  });

  const nameExists = registeredAirlines.some(
    (a) => a.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (nameExists) {
    throw Object.assign(new Error("Airline brand name is already registered"), { status: 400 });
  }

  const emailExists = registeredAirlines.some(
    (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
  );
  if (emailExists) {
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

export async function updateAirlineFlight(
  airlineId: string,
  flightId: string,
  payload: {
    origin?: string;
    destination?: string;
    flightNumber?: string;
    departure?: string;
    arrival?: string;
    basePriceCents?: number;
  }
) {
  const flight = await prisma.flight.findUnique({
    where: { id: flightId }
  });

  if (!flight) {
    throw Object.assign(new Error("Flight not found"), { status: 404 });
  }

  if (flight.registeredAirlineId !== airlineId) {
    throw Object.assign(new Error("Unauthorized: You do not own this flight"), { status: 403 });
  }

  const updateData: any = {};
  if (payload.origin !== undefined) updateData.origin = payload.origin.trim().toUpperCase();
  if (payload.destination !== undefined) updateData.destination = payload.destination.trim().toUpperCase();
  if (payload.flightNumber !== undefined) updateData.flightNumber = payload.flightNumber.trim().toUpperCase();
  if (payload.departure !== undefined) updateData.departure = new Date(payload.departure);
  if (payload.arrival !== undefined) updateData.arrival = new Date(payload.arrival);
  if (payload.basePriceCents !== undefined) updateData.basePriceCents = payload.basePriceCents;

  const updatedFlight = await prisma.flight.update({
    where: { id: flightId },
    data: updateData
  });

  invalidateRoutesCache();
  return updatedFlight;
}

export async function deleteAirlineFlight(airlineId: string, flightId: string) {
  const flight = await prisma.flight.findUnique({
    where: { id: flightId }
  });

  if (!flight) {
    throw Object.assign(new Error("Flight not found"), { status: 404 });
  }

  if (flight.registeredAirlineId !== airlineId) {
    throw Object.assign(new Error("Unauthorized: You do not own this flight"), { status: 403 });
  }

  // Get bookings for this flight
  const bookings = await prisma.booking.findMany({
    where: { flightId: flightId },
    select: { id: true }
  });
  const bookingIds = bookings.map(b => b.id);

  await prisma.$transaction([
    // Delete payments first
    prisma.payment.deleteMany({
      where: { bookingId: { in: bookingIds } }
    }),
    // Delete bookings next
    prisma.booking.deleteMany({
      where: { flightId: flightId }
    }),
    // Finally delete flight
    prisma.flight.delete({
      where: { id: flightId }
    })
  ]);

  invalidateRoutesCache();
}

export async function deleteAirlineAccount(airlineId: string) {
  // Get all flights registered by this airline
  const flights = await prisma.flight.findMany({
    where: { registeredAirlineId: airlineId },
    select: { id: true }
  });
  const flightIds = flights.map(f => f.id);

  // Find all bookings for these flights
  const bookings = await prisma.booking.findMany({
    where: { flightId: { in: flightIds } },
    select: { id: true }
  });
  const bookingIds = bookings.map(b => b.id);

  // Run cascading deletes in a transaction
  await prisma.$transaction([
    // 1. Delete payments for bookings of this airline's flights
    prisma.payment.deleteMany({
      where: { bookingId: { in: bookingIds } }
    }),
    // 2. Delete bookings for this airline's flights
    prisma.booking.deleteMany({
      where: { flightId: { in: flightIds } }
    }),
    // 3. Delete flights registered by this airline
    prisma.flight.deleteMany({
      where: { registeredAirlineId: airlineId }
    }),
    // 4. Finally delete the airline record itself
    prisma.airline.delete({
      where: { id: airlineId }
    })
  ]);

  invalidateRoutesCache();
}


