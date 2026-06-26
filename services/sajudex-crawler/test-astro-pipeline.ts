import { runAstroDatabankDiscover } from './src/pipeline/discover-astrodatabank';
import { runAstroDatabankExtract } from './src/pipeline/extract-astrodatabank';
import { runAstroDatabankTransform } from './src/pipeline/transform-astrodatabank';

async function testPipeline() {
  console.log('🧪 아스트로 데이터뱅크 파이프라인 자동화 테스트 시작...');

  console.log('\n--- [Step 0] Discover (목록 탐색) 시작 ---');
  // 주의: AllPages 전체를 돌면 너무 오래 걸리니, 
  // 실제 프로덕션에서 돌릴 때는 별도의 스크립트나 크론으로 분리하세요.
  // 현재 스크립트에는 limit를 걸어두지 않았으므로 너무 길어지면 Ctrl+C로 종료하세요.
  await runAstroDatabankDiscover();

  console.log('\n--- [Step 1] Extract (HTML 긁어오기) 시작 ---');
  await runAstroDatabankExtract();

  console.log('\n--- [Step 2] Transform & Load (파싱 후 DB 적재) 시작 ---');
  await runAstroDatabankTransform();

  console.log('\n✅ 자동화 파이프라인 종료 완료.');
  process.exit(0);
}

testPipeline().catch(console.error);
