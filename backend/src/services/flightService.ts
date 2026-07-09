import { prisma } from "../db";

export async function ensureFlightsSeededForDate(dateStr: string) {
  // Validate dateStr format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;

  const dateStart = new Date(dateStr);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStr);
  dateEnd.setHours(23, 59, 59, 999);

  // Check if flights exist for this date
  const count = await prisma.flight.count({
    where: {
      departure: {
        gte: dateStart,
        lte: dateEnd
      }
    }
  });

  if (count > 0) {
    return; // Already seeded
  }

  // Seed flights for this date
  const airports = ["DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "PNQ", "AMD", "GOI", "COK", "JAI"];
  const airlines = ["IndiGo", "Air India", "Vistara", "Akasa Air", "SpiceJet", "Air India Express"];
  const flightsToCreate: any[] = [];
  let flightCounter = 100 + Math.floor(Math.random() * 1000);

  for (const origin of airports) {
    for (const destination of airports) {
      if (origin === destination) continue;

      const numFlights = 2;
      for (let i = 0; i < numFlights; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const flightNum = `${airline.split(" ").map(w => w[0]).join("").toUpperCase()}-${flightCounter++}`;

        const depHour = i === 0 
          ? Math.floor(Math.random() * 6) + 6   // 6 AM to 11 AM
          : Math.floor(Math.random() * 7) + 14; // 2 PM to 8 PM
        const depMinutes = Math.random() < 0.5 ? 0 : 30;

        const departure = new Date(`${dateStr}T${String(depHour).padStart(2, "0")}:${String(depMinutes).padStart(2, "0")}:00Z`);
        const durationMinutes = Math.floor(Math.random() * 90) + 90;
        const arrival = new Date(departure.getTime() + durationMinutes * 60 * 1000);
        const basePriceCents = (Math.floor(Math.random() * 68) + 30) * 10000;

        flightsToCreate.push({
          origin,
          destination,
          airline,
          flightNumber: flightNum,
          departure,
          arrival,
          basePriceCents
        });
      }
    }
  }

  try {
    await prisma.flight.createMany({ data: flightsToCreate });
    console.log(`Dynamically seeded ${flightsToCreate.length} flights for date ${dateStr}`);
  } catch (err) {
    console.error(`Failed to dynamically seed flights for date ${dateStr}:`, err);
  }
}

export async function ensureUpcomingFlightsSeeded() {
  const count = await prisma.flight.count({
    where: {
      departure: {
        gt: new Date()
      }
    }
  });

  if (count > 0) return;

  // No upcoming flights! Let's seed today and the next 7 days.
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const offsetDate = new Date(today);
    offsetDate.setDate(today.getDate() + i);
    const offsetDateStr = new Date(offsetDate.getTime() - offsetDate.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0];
    await ensureFlightsSeededForDate(offsetDateStr);
  }
}

export async function searchFlights(origin: string, destination: string, date?: string) {
  if (date) {
    await ensureFlightsSeededForDate(date);
  }

  const where: any = {
    origin: { equals: origin },
    destination: { equals: destination }
  };

  if (date) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    where.departure = {
      gte: dateStart,
      lte: dateEnd
    };
  }

  return prisma.flight.findMany({
    where,
    orderBy: { departure: "asc" }
  });
}

export async function getFlightById(id: string) {
  return prisma.flight.findUnique({ where: { id } });
}

// In-memory cache for flight routes to optimize performance
let cachedRoutes: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // Cache TTL of 30 seconds

export async function getAvailableRoutes(date?: string) {
  if (date) {
    await ensureFlightsSeededForDate(date);
    
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    return prisma.flight.groupBy({
      by: ["origin", "destination"],
      where: {
        departure: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      _count: {
        id: true
      }
    });
  }

  await ensureUpcomingFlightsSeeded();

  const now = Date.now();
  if (cachedRoutes && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedRoutes;
  }

  cachedRoutes = await prisma.flight.groupBy({
    by: ["origin", "destination"],
    where: {
      departure: {
        gt: new Date()
      }
    },
    _count: {
      id: true
    }
  });
  cacheTimestamp = now;
  return cachedRoutes;
}

export function invalidateRoutesCache() {
  cachedRoutes = null;
  cacheTimestamp = 0;
}


