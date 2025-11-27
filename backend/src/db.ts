import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL || "";
if (!url || !(url.startsWith("postgresql://") || url.startsWith("postgres://"))) {
  throw new Error("Invalid or missing DATABASE_URL. It must start with postgresql:// or postgres://");
}

export const prisma = new PrismaClient({ datasources: { db: { url } } });