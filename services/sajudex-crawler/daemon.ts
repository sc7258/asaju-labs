import { runAstroDatabankExtract } from './src/pipeline/extract-astrodatabank';
import { runAstroDatabankTransform } from './src/pipeline/transform-astrodatabank';
import { prisma } from './src/db/client';

async function daemon() {
  console.log('🚀 Starting Astrodatabank Background Daemon...');
  
  while (true) {
    try {
      // 1. 빈 HTML이 있는 Raw 데이터 갯수 확인
      const emptyCount = await prisma.rawAstroDatabank.count({
        where: { processStatus: 'PENDING', rawHtml: '' }
      });

      // 2. 파싱을 기다리는 HTML이 채워진 데이터 갯수 확인 (처음 시작 시 잔여물 확인용)
      let pendingTransformCount = await prisma.rawAstroDatabank.count({
        where: { processStatus: 'PENDING', rawHtml: { not: '' } }
      });

      console.log(`\n📊 Status - Empty HTML: ${emptyCount}, Ready to Transform: ${pendingTransformCount}`);

      if (emptyCount === 0 && pendingTransformCount === 0) {
        console.log('✅ All profiles have been successfully extracted and transformed!');
        break;
      }

      // 1. Transform 먼저 (밀린 파싱이 있으면 처리)
      if (pendingTransformCount > 0) {
        await runAstroDatabankTransform();
      }

      // 2. Extract 진행
      if (emptyCount > 0) {
        await runAstroDatabankExtract();
        // Extract가 끝난 직후 방금 다운받은 50개를 바로 Transform!
        await runAstroDatabankTransform();
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (e) {
      console.error('Daemon Error:', e);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

daemon().finally(() => prisma.$disconnect());
