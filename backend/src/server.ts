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

app.set("trust proxy", 1);

// 🩺 HEALTHCHECK FIRST — OUTSIDE EVERYTHING
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

// 🌍 CORS (after healthcheck)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowList = [
        "http://localhost:3000",
        process.env.FRONTEND_URL || undefined,
      ].filter(Boolean);

      if (!origin) return callback(null, true);

      const allowed =
        allowList.includes(origin) ||
        (origin && origin.endsWith(".vercel.app"));

      if (allowed) return callback(null, true);

      return callback(null, false);
    },
    credentials: true,
  })
);

// 🛡 Helmet AFTER CORS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 📦 JSON parsing
app.use(express.json());

// ⏱ Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// 🛣 API Routes
app.use("/api", router);

// ❗ Global Error Handler
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// --- SEED FUNCTION ---
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
          basePriceCents: 55000,
        },
        {
          origin: "DEL",
          destination: "BOM",
          airline: "FlyFast",
          flightNumber: "FF201",
          departure: new Date("2025-12-20T09:00:00Z"),
          arrival: new Date("2025-12-20T11:15:00Z"),
          basePriceCents: 48000,
        },
        {
          origin: "BLR",
          destination: "MYS",
          airline: "SkyJet",
          flightNumber: "SJ300",
          departure: new Date("2025-12-22T13:00:00Z"),
          arrival: new Date("2025-12-22T14:30:00Z"),
          basePriceCents: 32000,
        },
      ],
      skipDuplicates: true,
    });
  } catch (e: any) {
    console.error("Seed skipped - database unreachable:", e?.message || e);
  }
}

app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
ensureSeed();
