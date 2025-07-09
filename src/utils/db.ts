import { PrismaClient } from "@prisma/client";
import { env } from "bun";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.ENV !== "production") globalForPrisma.prisma = db;
