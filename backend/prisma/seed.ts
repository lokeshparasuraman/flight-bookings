import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding flights...");

  const airports = ["DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "PNQ", "AMD", "GOI", "COK", "JAI"];
  const airlines = ["IndiGo", "Air India", "Vistara", "Akasa Air", "SpiceJet", "Air India Express"];

  const flightsToCreate: any[] = [];
  const today = new Date();

  // Create flights for the next 15 days
  for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];

    // For each day, generate flights
    let flightCounter = 100 + dayOffset * 15;
    
    for (const origin of airports) {
      for (const destination of airports) {
        if (origin === destination) continue;

        // Seed exactly 2 flights per day for every route pair (one morning, one evening)
        const numFlights = 2;
        
        for (let i = 0; i < numFlights; i++) {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const flightNum = `${airline.split(" ").map(w => w[0]).join("").toUpperCase()}-${flightCounter++}`;
          
          // Morning (6 AM - 11 AM) vs Evening (2 PM - 8 PM)
          const depHour = i === 0 
            ? Math.floor(Math.random() * 6) + 6   // 6 AM to 11 AM
            : Math.floor(Math.random() * 7) + 14; // 2 PM to 8 PM
          const depMinutes = Math.random() < 0.5 ? 0 : 30;
          
          const departure = new Date(`${dateStr}T${String(depHour).padStart(2, "0")}:${String(depMinutes).padStart(2, "0")}:00Z`);
          
          // Flight duration between 1.5 to 3 hours
          const durationMinutes = Math.floor(Math.random() * 90) + 90;
          const arrival = new Date(departure.getTime() + durationMinutes * 60 * 1000);
          
          // Price in cents: between ₹3,000 (300000 cents) and ₹9,800 (980000 cents)
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
  }

  console.log(`Generated ${flightsToCreate.length} flights for seeding.`);

  // Clean existing flights first to avoid duplicate errors / key issues when re-seeding
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.flight.deleteMany({});
  console.log("Deleted old flights and dependent bookings/payments.");

  // Insert in batches of 100 to be friendly to Neon database limits and speed
  const batchSize = 100;
  for (let i = 0; i < flightsToCreate.length; i += batchSize) {
    const batch = flightsToCreate.slice(i, i + batchSize);
    await prisma.flight.createMany({ data: batch });
  }
  console.log(`Successfully seeded ${flightsToCreate.length} flights.`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
