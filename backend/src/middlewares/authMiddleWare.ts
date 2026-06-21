import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request {
  userId?: string;
  airlineId?: string;
  role?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid token format" });

  const token = parts[1];

  try {
    if (!JWT_SECRET) return res.status(500).json({ error: "Server misconfiguration" });
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.role = payload.role || "USER";
    if (!req.userId) return res.status(401).json({ error: "Invalid token" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAirlineAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid token format" });

  const token = parts[1];

  try {
    if (!JWT_SECRET) return res.status(500).json({ error: "Server misconfiguration" });
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "AIRLINE") {
      return res.status(403).json({ error: "Forbidden: Access restricted to registered airlines" });
    }
    req.airlineId = payload.sub;
    req.role = payload.role;
    if (!req.airlineId) return res.status(401).json({ error: "Invalid token" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
