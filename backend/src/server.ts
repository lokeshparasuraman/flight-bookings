import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Security Headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

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

// Start Server
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
