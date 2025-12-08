import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request {
  userId?: string;
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
    // Token was signed with { sub: user.id, ... }
    req.userId = payload.sub;
    if (!req.userId) return res.status(401).json({ error: "Invalid token" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
