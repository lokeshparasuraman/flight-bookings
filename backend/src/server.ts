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

// --------------------------------------------------------
// ❤️ HEALTH CHECK (NO CORS RESTRICTIONS)
// --------------------------------------------------------
app.get("/health", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("OK");
});

// --------------------------------------------------------
// 🌍 CORS CONFIGURATION — MUST BE BEFORE EVERYTHING ELSE
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
// 🔥 HANDLE PREFLIGHT REQUESTS EARLY (CRITICAL FOR FIXING CORS)
// --------------------------------------------------------
app.options("*", cors());

// --------------------------------------------------------
// 🛡 SECURITY HEADERS
// --------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// --------------------------------------------------------
// 📦 JSON BODY PARSING
// --------------------------------------------------------
app.use(express.json({ limit: "200kb" }));

// --------------------------------------------------------
// 📝 LOGGING (OPTIONAL BUT USEFUL)
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
// 🚀 ROUTES (MUST COME BEFORE RATE LIMITERS!)
// --------------------------------------------------------
app.use("/api", router);

// --------------------------------------------------------
// ⏱ RATE LIMITERS — MUST BE AFTER ROUTES
// Otherwise OPTIONS requests get blocked → CORS errors
// --------------------------------------------------------
const authLimiter = rateLimit({ windowMs: 60_000, max: 30 });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 20 });

app.use("/api/auth", authLimiter);
app.use("/api/chat", chatLimiter);

// --------------------------------------------------------
// ❌ ERROR HANDLER — ALWAYS LAST
// --------------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------------
// 🚀 START SERVER
// --------------------------------------------------------
const port = Number(process.env.PORT) || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${port}`);
});
