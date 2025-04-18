import { PrismaClient } from "@prisma/client";
import { env } from "bun";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const db = globalForPrisma.prisma || new PrismaClient();

if (env.ENV !== "production") globalForPrisma.prisma = db;
