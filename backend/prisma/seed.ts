import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding flights...");
  await prisma.flight.createMany({
    data: [
      {
        origin: "DEL",
        destination: "BOM",
        airline: "DemoAir",
        flightNumber: "DA101",
        departure: new Date("2025-12-20T06:00:00Z"),
        arrival: new Date("2025-12-20T08:10:00Z"),
        basePriceCents: 55000
      },
      {
        origin: "DEL",
        destination: "BOM",
        airline: "FlyFast",
        flightNumber: "FF201",
        departure: new Date("2025-12-20T09:00:00Z"),
        arrival: new Date("2025-12-20T11:15:00Z"),
        basePriceCents: 48000
      },
      {
        origin: "BLR",
        destination: "MYS",
        airline: "SkyJet",
        flightNumber: "SJ300",
        departure: new Date("2025-12-22T13:00:00Z"),
        arrival: new Date("2025-12-22T14:30:00Z"),
        basePriceCents: 32000
      }
    ],
    skipDuplicates: true
  });
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
