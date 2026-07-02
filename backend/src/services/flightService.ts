import { prisma } from "../db";

export async function searchFlights(origin: string, destination: string, date?: string) {
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

export async function getAvailableRoutes() {
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

