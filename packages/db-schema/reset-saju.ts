import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sajuCount = await prisma.masterSaju.count();
  const peopleCount = await prisma.curatedPerson.count();
  
  console.log(`MasterSaju count: ${sajuCount}`);
  console.log(`CuratedPerson count: ${peopleCount}`);

  if (sajuCount > 0) {
    // 1. CuratedPerson의 Saju 참조를 모두 null로 해제 (FK 제약 조건 에러 방지)
    console.log('Unlinking foreign keys in CuratedPerson...');
    await prisma.curatedPerson.updateMany({
      data: {
        bonwonSajuId: null,
        charyeokSajuId: null,
        buheojaBonwonSajuId: null,
        buheojaCharyeokSajuId: null,
        heojaBonwonSajuId: null,
        heojaCharyeokSajuId: null,
      }
    });

    // 2. MasterSaju 데이터 일괄 삭제
    console.log('Deleting all existing MasterSaju records...');
    await prisma.masterSaju.deleteMany({});
    console.log('MasterSaju table has been reset successfully.');
  } else {
    console.log('MasterSaju table is already empty. No action needed.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
