import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  const code = err.code || err?.meta?.code;
  const msg = String(message || "");

  if (code === "P1001" || msg.includes("Can't reach database server")) {
    status = 503;
    message = "Service temporarily unavailable. Please try again later.";
  }

  res.status(status).json({ error: message });
}
