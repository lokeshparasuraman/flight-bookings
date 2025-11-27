import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { prisma } from "./db";

const app = express();
app.set("trust proxy", true);
// Security Headers
app.use(helmet());

//CORS
app.use(cors());

// JSON Body Parsing
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120
});
app.use(limiter);

// API Routes
app.use("/api", router);

// Error Handler
app.use(errorHandler);

// Healthcheck (must be before listen)
app.get("/health", (_, res) => res.send("OK"));

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function ensureSeed() {
  try {
    const count = await prisma.flight.count();
    if (count > 0) return;
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
  } catch (e: any) {
    console.error("Seed skipped - database unreachable:", e?.message || e);
  }
}

app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
ensureSeed();
