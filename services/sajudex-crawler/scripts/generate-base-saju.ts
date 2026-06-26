import { prisma } from '../src/db/client';

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function get60Gapja() {
  const gapja: string[][] = [];
  for (let i = 0; i < 60; i++) {
    gapja.push([stems[i % 10], branches[i % 12]]);
  }
  return gapja;
}

const monthStartStemIndex: Record<string, number> = {
  "甲": 2, "己": 2,
  "乙": 4, "庚": 4,
  "丙": 6, "辛": 6,
  "丁": 8, "壬": 8,
  "戊": 0, "癸": 0,
};

export async function generateBaseSaju() {
  console.log('🌟 순수 수학적 알고리즘으로 43,200개 삼주(Samju) 생성 시작...');
  const gapja60 = get60Gapja();
  let batchData: any[] = [];
  let totalInserted = 0;

  for (const yearPillar of gapja60) {
    const yStem = yearPillar[0];
    const mStartIndex = monthStartStemIndex[yStem];

    for (let m = 0; m < 12; m++) {
      const mStem = stems[(mStartIndex + m) % 10];
      const mBranch = branches[(2 + m) % 12];

      for (const dayPillar of gapja60) {
        const dStem = dayPillar[0];
        
        batchData.push({
          yearStem: yStem, yearBranch: yearPillar[1],
          monthStem: mStem, monthBranch: mBranch,
          dayStem: dStem, dayBranch: dayPillar[1],
        });

        if (batchData.length >= 10000) {
          await prisma.masterSaju.createMany({
            data: batchData,
            skipDuplicates: true
          });
          totalInserted += batchData.length;
          process.stdout.write(`\rInserted: ${totalInserted}`);
          batchData = [];
        }
      }
    }
  }

  if (batchData.length > 0) {
    await prisma.masterSaju.createMany({
      data: batchData,
      skipDuplicates: true
    });
    totalInserted += batchData.length;
  }

  console.log(`\n✅ 성공적으로 ${totalInserted}개의 순수 삼주 사전 생성을 완료했습니다!`);
}

if (require.main === module) {
  generateBaseSaju().then(() => process.exit(0)).catch(console.error);
}
