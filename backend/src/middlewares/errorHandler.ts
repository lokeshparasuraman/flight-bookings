import { Request, Response, NextFunction } from "express";

/**
 * Interface representing custom HTTP errors with attached status codes.
 */
export interface HttpError extends Error {
  status?: number;
  code?: string;
  meta?: {
    code?: string;
    [key: string]: any;
  };
}

/**
 * Global Express error handling middleware.
 * Traps unhandled runtime errors, formats them safely, and prevents
 * sensitive database or system error stacks from leaking to clients.
 *
 * @param err - Unhandled error thrown by controllers or services
 * @param _req - Express Request object (prefixed with underscore to indicate unused)
 * @param res - Express Response object
 * @param _next - Express NextFunction callback
 */
export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error internally for debugging and diagnostics
  console.error(`[Error Handler] Error occurred:`, err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  let status = err.status || 500;
  let message = err.message || "Internal server error";

  const dbCode = err.code || err?.meta?.code;
  const rawMsg = String(message).toLowerCase();

  // Handle common database connectivity exceptions gracefully
  if (dbCode === "P1001" || rawMsg.includes("can't reach database server") || rawMsg.includes("database connection failed")) {
    status = 503;
    message = "Service temporarily unavailable. Please try again later.";
  }

  res.status(status).json({ error: message });
}

