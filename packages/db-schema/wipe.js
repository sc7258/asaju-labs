const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.masterSaju.deleteMany();
  console.log('Wiped');
}

main().finally(() => prisma.$disconnect());
