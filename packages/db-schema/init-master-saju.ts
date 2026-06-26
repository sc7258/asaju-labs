import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SEXAGENARY_CYCLE = Array.from({ length: 60 }, (_, i) => STEMS[i % 10]! + BRANCHES[i % 12]!);

function getMonthPillar(yearStem: string, monthIndex: number): string {
  let startStemIndex = 0;
  if (yearStem === '甲' || yearStem === '己') startStemIndex = 2;
  else if (yearStem === '乙' || yearStem === '庚') startStemIndex = 4;
  else if (yearStem === '丙' || yearStem === '辛') startStemIndex = 6;
  else if (yearStem === '丁' || yearStem === '壬') startStemIndex = 8;
  else if (yearStem === '戊' || yearStem === '癸') startStemIndex = 0;

  const diffFromIn = (monthIndex - 2 + 12) % 12;
  const stemIndex = (startStemIndex + diffFromIn) % 10;
  
  return STEMS[stemIndex]! + BRANCHES[monthIndex]!;
}

async function main() {
  console.log('Generating 43,200 MasterSaju dictionary records...');
  const records = [];

  for (let y = 0; y < 60; y++) {
    const yearPillar = SEXAGENARY_CYCLE[y]!;
    const yearStem = yearPillar.charAt(0);
    const yearBranch = yearPillar.charAt(1);

    for (let m = 0; m < 12; m++) {
      const monthPillar = getMonthPillar(yearStem, m);
      const monthStem = monthPillar.charAt(0);
      const monthBranch = monthPillar.charAt(1);

      for (let d = 0; d < 60; d++) {
        const dayPillar = SEXAGENARY_CYCLE[d]!;
        const dayStem = dayPillar.charAt(0);
        const dayBranch = dayPillar.charAt(1);

        const id = (y * 12 * 60) + (m * 60) + d;

        records.push({
          id,
          yearStem,
          yearBranch,
          monthStem,
          monthBranch,
          dayStem,
          dayBranch
        });
      }
    }
  }

  console.log(`Inserting ${records.length} records into the database...`);
  
  const chunkSize = 5000;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await prisma.masterSaju.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Progress: ${Math.min(i + chunkSize, records.length)} / ${records.length}`);
  }

  console.log('MasterSaju initialization perfectly complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
