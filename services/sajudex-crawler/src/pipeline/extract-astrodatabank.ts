import { AstroDatabankClient } from '../sources/astrodatabank/astrodatabank-client';
import { prisma } from '../db/client';

export async function runAstroDatabankExtract() {
  console.log('Starting AstroDatabank Extraction Pipeline...');
  
  // 1. 가져올 대상 조회 (HTML이 비어있는 PENDING 상태의 레코드들)
  const pendingTargets = await prisma.rawAstroDatabank.findMany({
    where: { 
      processStatus: 'PENDING',
      rawHtml: '' // 본문이 없는 껍데기 시드
    },
    take: 20 // 20개씩 병렬 수집
  });

  if (pendingTargets.length === 0) {
    console.log('No empty raw targets found to extract.');
    return;
  }

  console.log(`Found ${pendingTargets.length} profiles to extract.`);
  const client = new AstroDatabankClient();
  let successCount = 0;
  let failCount = 0;

  await Promise.all(pendingTargets.map(async (profile) => {
    try {
      console.log(`[Parallel] Extracting HTML for: ${profile.title}`);
      await client.fetchAndStoreRawPage(profile.title, profile.url);
      successCount++;
      
      // 서버 과부하 방지를 위해 랜덤 딜레이 (1~3초)
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (e) {
      console.error(`Failed to extract ${profile.title}`, e);
      failCount++;
    }
  }));

  console.log(`Extraction Completed. Success: ${successCount}, Fail: ${failCount}`);
}
