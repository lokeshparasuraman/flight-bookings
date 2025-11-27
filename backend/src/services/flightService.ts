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
