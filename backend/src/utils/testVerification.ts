import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../db";
import * as airlineService from "../services/airlineService";
import * as bookingService from "../services/bookingService";
import bcrypt from "bcrypt";

async function runVerification() {
  console.log("----------------------------------------------------------------------");
  console.log("⚡ Starting End-to-End Automated SDE-2 Integration Verification");
  console.log("----------------------------------------------------------------------\n");

  const testAirlineEmail = "vistara@partner.com";
  const testUserEmail = "loki@passenger.com";

  try {
    // 1. Clean up potential leftover test data from previous runs
    console.log("🧹 Cleaning up stale test data...");
    
    // Find users with test email or test phone
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: testUserEmail },
          { phone: "+919876543210" }
        ]
      },
      select: { id: true }
    });
    const userIds = existingUsers.map(u => u.id);

    if (userIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { booking: { userId: { in: userIds } } }
      });
      await prisma.booking.deleteMany({
        where: { userId: { in: userIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } }
      });
    }

    await prisma.flight.deleteMany({
      where: { registeredAirline: { email: testAirlineEmail } }
    });
    await prisma.airline.deleteMany({
      where: { email: testAirlineEmail }
    });
    console.log("✓ Cleanup finished successfully.\n");

    // 2. Register a new airline operator
    console.log("🛫 Step 1: Registering new airline operator 'Vistara Partner'...");
    const { airline, token: airlineToken } = await airlineService.registerAirline(
      "Vistara Partner",
      testAirlineEmail,
      "Password123!"
    );
    console.log(`✓ Airline registered. ID: ${airline.id}, Token issued.`);

    // 3. Register a new flight route from DEL to BOM
    console.log("\n✈️ Step 2: Registering new route VS-901 (DEL ➔ BOM)...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const departureTime = new Date(tomorrow);
    departureTime.setHours(10, 0, 0, 0);
    const arrivalTime = new Date(tomorrow);
    arrivalTime.setHours(12, 30, 0, 0);

    const flight = await airlineService.createAirlineFlight(airline.id, {
      origin: "DEL",
      destination: "BOM",
      flightNumber: "VS-901",
      departure: departureTime.toISOString(),
      arrival: arrivalTime.toISOString(),
      basePriceCents: 500000 // ₹5,000.00
    });
    console.log(`✓ Flight route created successfully. ID: ${flight.id}, Number: ${flight.flightNumber}`);

    // 4. Create a passenger user account with verified status
    console.log("\n👤 Step 3: Registering passenger user account 'Lokesh Parasuraman'...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
        name: "Lokesh Parasuraman",
        phone: "+919876543210",
        phoneVerified: true
      }
    });
    console.log(`✓ Passenger registered. ID: ${user.id}`);

    // 5. Book two seats with separate passenger names
    console.log("\n🎟️ Step 4: Creating booking for 2 seats (4B, 4C) with passenger details...");
    
    // Add-on cost calculations (mocking UI):
    // 2 outbound seats base: 5,000 * 2 = 10,000
    // Seat selection fee: 800 * 2 = 1,600
    // Meal addon (Vegetarian): +450
    // Total: ₹12,050.00 (1205000 cents)
    const basePriceTotal = flight.basePriceCents * 2;
    const seatSelectionFees = 80000 * 2;
    const mealAddonFee = 45000;
    const bookingTotalCents = basePriceTotal + seatSelectionFees + mealAddonFee;

    const booking = await bookingService.createBooking(user.id, flight.id, {
      seatNumber: "4B, 4C",
      passengerNames: "Lokesh Parasuraman, Aditya Sen",
      luggageOption: "15kg (Included)",
      mealOption: "Vegetarian Standard",
      wifiOption: "None",
      insuranceOption: "None",
      totalPriceCents: bookingTotalCents
    });
    
    console.log(`✓ Booking initiated in PENDING status. Booking ID: ${booking.id}`);
    console.log(`  Seats: ${booking.seatNumber}`);
    console.log(`  Passenger list: ${booking.passengerNames}`);
    console.log(`  Total price: ₹${(booking.priceCents / 100).toFixed(2)}`);

    // Verify duplicate validation guard details (like our UI flow checks)
    if (booking.status !== "PENDING") {
      throw new Error(`Booking should start as PENDING, but got: ${booking.status}`);
    }

    // 6. Process checkout payment via UPI
    console.log("\n💳 Step 5: Completing payment via UPI (loki@oksbi)...");
    const updatedBooking = await bookingService.payForBooking(user.id, booking.id, {
      method: "UPI",
      upiId: "loki@oksbi"
    });

    console.log(`✓ Payment processed. Booking status updated to: ${updatedBooking.status}`);
    
    // 7. Verify database constraints & records
    console.log("\n🔍 Step 6: Verifying DB records post-checkout...");
    
    const dbBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { payments: true }
    });

    if (!dbBooking) throw new Error("Booking not found in DB!");
    if (dbBooking.status !== "CONFIRMED") throw new Error("Booking is not CONFIRMED!");
    if (dbBooking.payments.length === 0) throw new Error("Payment record missing!");
    if (dbBooking.payments[0].status !== "SUCCESS") throw new Error("Payment status is not SUCCESS!");
    
    console.log(`✓ Verified booking '${dbBooking.id}' is CONFIRMED.`);
    console.log(`✓ Verified payment amount: ₹${(dbBooking.payments[0].amountCents / 100).toFixed(2)} (${dbBooking.payments[0].method})`);

    // 8. Verify Airline Console Dashboard telemetries
    console.log("\n📈 Step 7: Verifying Airline dashboard telemetry metrics...");
    
    const airlineFlights = await airlineService.getAirlineFlights(airline.id);
    const airlineBookings = await airlineService.getAirlineBookings(airline.id);

    console.log(`  Telemetry metrics fetched:`);
    console.log(`  - Total Routes: ${airlineFlights.length} (Expected: 1)`);
    console.log(`  - Total Bookings: ${airlineBookings.length} (Expected: 1)`);
    
    const revenueCents = airlineBookings
      .filter(b => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.priceCents, 0);
    console.log(`  - Total Revenue Earned: ₹${(revenueCents / 100).toFixed(2)}`);

    if (airlineFlights.length !== 1) throw new Error("Airline flight route count mismatch!");
    if (airlineBookings.length !== 1) throw new Error("Airline bookings count mismatch!");
    if (revenueCents !== bookingTotalCents) throw new Error("Earned revenue mismatch!");

    console.log("✓ Telemetry matches expected outputs.");

    // 9. Clean up DB records to leave the environment clean
    console.log("\n🧹 Step 8: Cleaning up test DB records...");
    await prisma.payment.deleteMany({
      where: { bookingId: booking.id }
    });
    await prisma.booking.deleteMany({
      where: { id: booking.id }
    });
    await prisma.flight.deleteMany({
      where: { id: flight.id }
    });
    await prisma.user.deleteMany({
      where: { id: user.id }
    });
    await prisma.airline.deleteMany({
      where: { id: airline.id }
    });
    console.log("✓ Cleanup finished successfully.");

    console.log("\n======================================================================");
    console.log("🎉 SUCCESS: E2E Programmatic Integration Verification PASSED!");
    console.log("======================================================================");
  } catch (err: any) {
    console.error("\n❌ ERROR: Verification failed!");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
