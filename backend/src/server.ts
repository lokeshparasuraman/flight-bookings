import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { prisma } from "./db";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

// --------------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------------
app.get("/health", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("OK");
});

// --------------------------------------------------------
// CORS Configuration
// --------------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://flight-bookings.vercel.app",
  ...(process.env.FRONTEND_URL?.split(",") || [])
]
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow backend-to-backend & tools
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// --------------------------------------------------------
// Handle preflight requests early
// --------------------------------------------------------
app.options("*", cors());

// --------------------------------------------------------
// HTTP Security Headers
// --------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// --------------------------------------------------------
// Response Compression
// --------------------------------------------------------
app.use(compression());

// --------------------------------------------------------
// JSON Request Body Parsing
// --------------------------------------------------------
app.use(express.json({ limit: "200kb" }));

// --------------------------------------------------------
// Request Logger Middleware
// --------------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --------------------------------------------------------
// API Rate Limiting Middleware
// --------------------------------------------------------
const authLimiter = rateLimit({ 
  windowMs: 60_000, 
  max: 30,
  skip: (req) => req.method === "OPTIONS"
});

const chatLimiter = rateLimit({ 
  windowMs: 60_000, 
  max: 20,
  skip: (req) => req.method === "OPTIONS"
});

app.use("/api/auth", authLimiter);
app.use("/api/chat", chatLimiter);

// --------------------------------------------------------
// Application Routes
// --------------------------------------------------------
app.use("/api", router);

// --------------------------------------------------------
// Global Error Handler
// --------------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------------
// 🚀 START SERVER
// --------------------------------------------------------
const port = Number(process.env.PORT) || 4000;
let server: any;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(port, "0.0.0.0", () => {
    console.log(`Backend running on port ${port}`);
  });
}

async function shutdown(signal: string) {
  try {
    console.log(`Received ${signal}. Closing server...`);
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await prisma.$disconnect();
    console.log("Shutdown complete.");
    process.exit(0);
  } catch (e) {
    console.error("Error during shutdown", e);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

export { app, server };

