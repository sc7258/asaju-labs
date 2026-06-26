
import { PrismaClient } from "@repo/db-schema";
const prisma = new PrismaClient();
async function run() {
  const rows = await prisma.$queryRawUnsafe(`SELECT id, wikidata_id FROM raw_wikipedia LIMIT 1`);
  console.log(rows);
  prisma.$disconnect();
}
run();

