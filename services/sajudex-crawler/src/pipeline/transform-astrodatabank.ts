import { prisma } from '../db/client';
import { AstroDatabankTransformer } from '../sources/astrodatabank/astrodatabank-transformer';
import { calculateSajuPlatesForSolarDate } from '../domain/saju-pillar-calculator';
import { calculateMasterSajuId } from '@repo/saju-core';

export async function runAstroDatabankTransform() {
  console.log('Starting AstroDatabank Transform & Load Pipeline...');

  const transformer = new AstroDatabankTransformer();

  // 1. 처리되지 않은 Raw 데이터 가져오기
  const pendingRecords = await prisma.rawAstroDatabank.findMany({
    where: { 
      processStatus: { in: ['PENDING', 'FAILED_RETRYABLE'] },
      rawHtml: { not: '' } // 수집 완료된(HTML이 있는) 레코드만
    },
    take: 50 // 병렬로 수집된 데이터를 빠르게 처리하기 위해 50개씩 가져옴
  });

  if (pendingRecords.length === 0) {
    console.log('No pending AstroDatabank records found.');
    return;
  }

  console.log(`Found ${pendingRecords.length} pending records.`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const raw of pendingRecords) {
    try {
      console.log(`Transforming ${raw.title}...`);
      // 진행 상태 업데이트 (PROCESSING)
      await prisma.rawAstroDatabank.update({
        where: { id: raw.id },
        data: { processStatus: 'PROCESSING', attemptCount: raw.attemptCount + 1, lastAttemptAt: new Date() }
      });

      // 2. HTML 파싱
      const parsed = transformer.parseProfileHtml(raw.rawHtml);

      if (!parsed.birthYear || !parsed.birthMonth || !parsed.birthDay) {
        throw new Error('Missing essential birth date information');
      }

      // 사주 명식 계산 및 MasterSaju ID 매핑 (Enrichment)
      let sajuData: any = {};
      try {
        const plates = await calculateSajuPlatesForSolarDate({
          year: parsed.birthYear,
          month: parsed.birthMonth,
          day: parsed.birthDay,
        });

        sajuData.sajuComputedAt = new Date();

        for (const plate of plates) {
          const yearPillar = plate.sajuYearStem + plate.sajuYearBranch;
          const monthPillar = plate.sajuMonthStem + plate.sajuMonthBranch;
          const dayPillar = plate.sajuDayStem + plate.sajuDayBranch;
          
          if (yearPillar.length === 2 && monthPillar.length === 2 && dayPillar.length === 2) {
            const masterId = calculateMasterSajuId(yearPillar, monthPillar, dayPillar);

            switch (plate.plateType) {
              case 'BONWON': sajuData.bonwonSajuId = masterId; break;
              case 'CHARYEOK': sajuData.charyeokSajuId = masterId; break;
              case 'BUHEOJA_BONWON': sajuData.buheojaBonwonSajuId = masterId; break;
              case 'BUHEOJA_CHARYEOK': sajuData.buheojaCharyeokSajuId = masterId; break;
              case 'HEOJA_BONWON': sajuData.heojaBonwonSajuId = masterId; break;
              case 'HEOJA_CHARYEOK': sajuData.heojaCharyeokSajuId = masterId; break;
            }
          }
        }
      } catch (calcError) {
        console.warn(`Could not calculate Saju for ${raw.title}:`, calcError);
      }

      // 3. 기존 데이터와 병합(Merge) 로직
      // 매칭 키: 원어명(originalName)으로 찾기
      const existingPerson = await prisma.curatedPerson.findFirst({
        where: { originalName: raw.title }
      });

      if (existingPerson) {
        // 기존 레코드가 있으면: 태어난 시간과 신뢰도 등급만 덮어쓰기 (Update)
        await prisma.curatedPerson.update({
          where: { id: existingPerson.id },
          data: {
            birthTime: parsed.birthTime || existingPerson.birthTime,
            birthPlaceName: parsed.birthPlaceName || existingPerson.birthPlaceName,
            gender: parsed.gender || existingPerson.gender,
            roddenRating: parsed.roddenRating || existingPerson.roddenRating,
            rawAstrodatabankId: raw.id, // 관계 연결
            source: 'ASTRODATABANK', // 출처 갱신 또는 유지
            ...sajuData
          }
        });
        console.log(`Merged (Updated) existing person: ${raw.title}`);
      } else {
        // 기존 레코드가 없으면: 새롭게 추가 (Insert)
        await prisma.curatedPerson.create({
          data: {
            displayName: raw.title, // 일단 타이틀을 표시 이름으로 사용 (추후 위키피디아 병합 시 한국어로 업데이트 됨)
            originalName: raw.title,
            birthYear: parsed.birthYear,
            birthMonth: parsed.birthMonth,
            birthDay: parsed.birthDay,
            birthTime: parsed.birthTime,
            birthPlaceName: parsed.birthPlaceName || null,
            gender: parsed.gender || null,
            roddenRating: parsed.roddenRating,
            source: 'ASTRODATABANK',
            sourceId: raw.url,
            sourceUrl: raw.url,
            wikipediaUrl: parsed.wikipediaUrl || null,
            rawAstrodatabankId: raw.id,
            ...sajuData
          }
        });
        console.log(`Inserted new person: ${raw.title}`);
      }

      // 4. 성공 처리
      await prisma.rawAstroDatabank.update({
        where: { id: raw.id },
        data: { processStatus: 'PROCESSED', processedAt: new Date(), processError: null }
      });
      
      successCount++;
    } catch (e: any) {
      console.error(`Failed to transform RawAstroDatabank ID ${raw.id}:`, e);
      // 에러 기록
      await prisma.rawAstroDatabank.update({
        where: { id: raw.id },
        data: { 
          processStatus: raw.attemptCount >= 3 ? 'FAILED_PERMANENT' : 'FAILED_RETRYABLE',
          processError: e.message 
        }
      });
      failCount++;
    }
  }

  console.log(`Transform Completed. Success: ${successCount}, Fail: ${failCount}`);
}
