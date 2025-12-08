import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Healthcheck
app.get("/health", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("OK");
});

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://flight-bookings.vercel.app",
  "https://flight-bookings-production.up.railway.app",
  ...(process.env.FRONTEND_URL?.split(",") || [])
]
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// This line is CRITICAL (handles preflight)
app.options("*", cors());

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// JSON
app.use(express.json({ limit: "200kb" }));

// Rate limit
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120
  })
);

const authLimiter = rateLimit({ windowMs: 60_000, max: 30 });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 20 });

app.use("/api/auth", authLimiter);
app.use("/api/chat", chatLimiter);

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const dur = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${dur}ms`);
  });
  next();
});

// Routes
app.use("/api", router);

// Error handler
app.use(errorHandler);

// Start server
const port = Number(process.env.PORT) || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${port}`);
});
