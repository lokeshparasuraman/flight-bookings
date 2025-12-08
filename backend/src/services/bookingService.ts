import { prisma } from "../db";
import type { Booking } from "@prisma/client";

/**
 * Ensures booking exists and belongs to the requesting user.
 * After this function runs, "booking" is guaranteed not null.
 */
function assertOwnership(
  booking: Booking | null,
  userId: string
): asserts booking is Booking {
  if (!booking) {
    throw Object.assign(new Error("Booking not found"), { status: 404 });
  }
  if (booking.userId !== userId) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
}

export async function createBooking(userId: string, flightId: string) {
  const flight = await prisma.flight.findUnique({ where: { id: flightId } });

  if (!flight) throw Object.assign(new Error("Flight not found"), { status: 404 });

  return prisma.booking.create({
    data: {
      userId,
      flightId,
      status: "PENDING",
      priceCents: flight.basePriceCents,
    },
  });
}

export async function confirmBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  assertOwnership(booking, userId);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  assertOwnership(booking, userId);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

export async function getUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { flight: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function payForBooking(
  userId: string,
  bookingId: string,
  payload: { method: string; upiId?: string; cardNumber?: string; cardBrand?: string }
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  assertOwnership(booking, userId);

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
      cardBrand: payload.cardBrand,
    },
  });

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });
}

export async function cancelAndRefund(userId: string, bookingId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    assertOwnership(booking, userId);

    const successfulPayment = booking.payments.find((p: any) => p.status === "SUCCESS");

    if (successfulPayment) {
      await tx.payment.create({
        data: {
          bookingId,
          method: successfulPayment.method,
          amountCents: booking.priceCents,
          status: "REFUNDED",
          upiId: successfulPayment.upiId,
          cardLast4: successfulPayment.cardLast4,
          cardBrand: successfulPayment.cardBrand,
        },
      });
    }

    await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });

    return { ok: true };
  });

  return result;
}
