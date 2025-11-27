import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createBooking(userId: string, flightId: string) {
  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) throw Object.assign(new Error("Flight not found"), { status: 404 });
  const booking = await prisma.booking.create({
    data: { userId, flightId, status: "PENDING", priceCents: flight.basePriceCents }
  });
  return booking;
}

export async function confirmBooking(bookingId: string) {
  // In real app: integrate payment provider then mark confirmed
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" }
  });
  return booking;
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });
  return booking;
}

export async function getUserBookings(userId: string) {
  return prisma.booking.findMany({ where: { userId }, include: { flight: true, payments: true }, orderBy: { createdAt: "desc" } });
}

export async function payForBooking(bookingId: string, payload: { method: string; upiId?: string; cardNumber?: string; cardBrand?: string }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
  if (booking.status === "CONFIRMED") return booking;

  const method = payload.method;
  let cardLast4: string | undefined;

  if (method === "UPI") {
    const id = (payload.upiId || "").trim();
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(id)) {
      throw Object.assign(new Error("Invalid UPI ID"), { status: 400 });
    }
    payload.upiId = id;
  }

  if (method === "CARD" && payload.cardNumber) {
    const n = payload.cardNumber.replace(/\s+/g, "");
    cardLast4 = n.slice(-4);
  }

  await prisma.payment.create({
    data: {
      bookingId,
      method,
      amountCents: booking.priceCents,
      status: "SUCCESS",
      upiId: payload.upiId,
      cardLast4,
      cardBrand: payload.cardBrand
    }
  });
  return prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
}

export async function cancelAndRefund(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payments: true } });
  if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });

  const upiPayment = (booking.payments || []).find(p => p.status === "SUCCESS" && p.method === "UPI" && !!p.upiId);
  if (upiPayment) {
    await prisma.payment.create({
      data: {
        bookingId,
        method: "UPI",
        amountCents: booking.priceCents,
        status: "REFUNDED",
        upiId: upiPayment.upiId || undefined
      }
    });
  }

  await prisma.payment.deleteMany({ where: { bookingId } });
  await prisma.booking.delete({ where: { id: bookingId } });
  return { ok: true };
}
