import { PrismaClient } from "@repo/db-schema";

import { loadCrawlerEnv } from "../config/env";

loadCrawlerEnv();

export const prisma = new PrismaClient();

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
