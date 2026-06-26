import { prisma } from './src/db/client';

async function main() {
  const result = await prisma.rawAstroDatabank.updateMany({
    where: { processStatus: 'PROCESSED' },
    data: { processStatus: 'PENDING' }
  });
  console.log(`Reset ${result.count} records to PENDING.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
