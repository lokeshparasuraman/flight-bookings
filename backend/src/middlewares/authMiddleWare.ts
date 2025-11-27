import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request { userId?: string }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
