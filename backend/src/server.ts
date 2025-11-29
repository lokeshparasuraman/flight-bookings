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

// --------------------------------------------------------
// 🩺 HEALTHCHECK FIRST — BEFORE EVERYTHING
// (NO CORS, NO HELMET, NO RATELIMITER, NO ERROR HANDLER)
app.get("/health", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("OK");
});
// --------------------------------------------------------

// 🌍 CORS (AFTER healthcheck)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowList = [
        "http://localhost:3000",
        process.env.FRONTEND_URL, // <-- your vercel URL
      ].filter(Boolean);

      // allow requests without an origin (curl, postman, etc.)
      if (!origin) return callback(null, true);

      const allowed =
        allowList.includes(origin) ||
        (origin && origin.endsWith(".vercel.app"));

      return callback(null, allowed);
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

// 📦 JSON Body Parsing
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

// 🚀 Start Server
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () =>
  console.log(`🚀 Backend running on port ${port}`)
);
