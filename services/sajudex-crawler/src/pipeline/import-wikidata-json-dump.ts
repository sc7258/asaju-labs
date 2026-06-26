import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataPeopleSeedRepository } from "../repositories/wikidata-people-seed-repository";
import {
  deleteCheckpoint,
  loadCheckpoint,
  saveCheckpoint,
} from "../checkpoint/dump-checkpoint";
import { getFirstWikidataTimeValue, isHumanWithBirthDate } from "../sources/wikidata/wikidata-entity-filter";
import { readWikidataJsonDump } from "../sources/wikidata/wikidata-dump-reader";
import { mapWikidataEntityToRawInput } from "../sources/wikidata/wikidata-mapper";
import { WikidataEntity } from "../sources/wikidata/wikidata-client";

/** Wikidata latest-all dump 예상 전체 entity 수 (진행률 계산용) */
const WIKIDATA_TOTAL_ENTITIES = 112_000_000;

export interface ImportWikidataJsonDumpOptions {
  filePath: string;
  limit?: number;
  skip?: number;
  progressEvery: number;
  /** checkpoint 저장 주기 (scannedCount 기준). 기본값: progressEvery와 동일 */
  checkpointEvery?: number;
  /** true면 저장된 checkpoint를 무시하고 처음부터 시작 */
  resetCheckpoint?: boolean;
  /** 배치 처리 크기 (기본: 50) */
  batchSize?: number;
}

export interface ImportWikidataJsonDumpResult {
  scannedCount: number;
  matchedCount: number;
  importedCount: number;
  failedCount: number;
}

interface PendingEntity {
  entity: WikidataEntity;
}

export async function importWikidataJsonDump(
  options: ImportWikidataJsonDumpOptions,
  rawWikipediaRepository: RawWikipediaRepository,
  seedRepository: WikidataPeopleSeedRepository,
): Promise<ImportWikidataJsonDumpResult> {
  const checkpointEvery = options.checkpointEvery ?? options.progressEvery;
  const batchSize = options.batchSize ?? 50;

  // checkpoint 불러오기
  let checkpoint = options.resetCheckpoint ? null : loadCheckpoint(options.filePath);

  if (checkpoint) {
    console.log(
      "[checkpoint] Resuming from checkpoint: scanned=" +
        checkpoint.scannedCount +
        ", matched=" +
        checkpoint.matchedCount +
        ", imported=" +
        checkpoint.importedCount +
        ", savedAt=" +
        checkpoint.savedAt,
    );
  }

  // checkpoint가 있으면 거기서부터, 없으면 --skip 옵션 사용
  const resumeSkip = checkpoint?.scannedCount ?? options.skip ?? 0;

  let scannedCount = checkpoint?.scannedCount ?? 0;
  let matchedCount = checkpoint?.matchedCount ?? 0;
  let importedCount = checkpoint?.importedCount ?? 0;
  let failedCount = checkpoint?.failedCount ?? 0;

  const startTime = Date.now();
  const startScanned = scannedCount; // 이번 세션 시작 시점의 scanned (ETA 계산용)

  // SIGINT(Ctrl+C) 시 checkpoint 저장 후 종료
  process.once("SIGINT", () => {
    console.log("\n[checkpoint] Interrupted. Saving checkpoint...");
    saveCheckpoint(options.filePath, { scannedCount, matchedCount, importedCount, failedCount });
    console.log("[checkpoint] Saved at scanned=" + scannedCount + ". Re-run to resume.");
    process.exit(0);
  });

  let pendingBatch: PendingEntity[] = [];

  const flushBatch = async () => {
    if (pendingBatch.length === 0) return;

    const inputs = pendingBatch.map((p) => mapWikidataEntityToRawInput(p.entity));

    try {
      const rawResults = await rawWikipediaRepository.batchUpsert(inputs);
      const idMap = new Map(rawResults.map((r) => [r.wikidataId, r.id]));

      const seedItems = pendingBatch.map((p) => ({
        wikidataId: p.entity.id,
        rawWikipediaId: idMap.get(p.entity.id) ?? 0,
        seed: {
          wikidataId: p.entity.id,
          label: p.entity.labels?.ko?.value ?? p.entity.labels?.en?.value,
          description: p.entity.descriptions?.ko?.value ?? p.entity.descriptions?.en?.value,
          birthDate: getFirstWikidataTimeValue(p.entity, "P569"),
        },
      })).filter((item) => item.rawWikipediaId !== 0);

      await seedRepository.batchMarkFetchedByWikidataIds(seedItems);

      importedCount += seedItems.length;
      failedCount += pendingBatch.length - seedItems.length;
    } catch (error) {
      console.error("[batch] Failed to import batch of " + pendingBatch.length + " entities, falling back to individual upserts. Error:", error instanceof Error ? error.message : error);
      
      for (const pending of pendingBatch) {
        try {
          const input = mapWikidataEntityToRawInput(pending.entity);
          const rawRow = await rawWikipediaRepository.upsert(input);
          
          const seedItem = {
            wikidataId: pending.entity.id,
            rawWikipediaId: rawRow.id,
            seed: {
              wikidataId: pending.entity.id,
              label: pending.entity.labels?.ko?.value ?? pending.entity.labels?.en?.value,
              description: pending.entity.descriptions?.ko?.value ?? pending.entity.descriptions?.en?.value,
              birthDate: getFirstWikidataTimeValue(pending.entity, "P569"),
            },
          };
          
          await seedRepository.batchMarkFetchedByWikidataIds([seedItem]);
          importedCount += 1;
        } catch (individualError) {
          failedCount += 1;
          console.error(`[batch] Failed to import individual entity ${pending.entity.id}:`, individualError instanceof Error ? individualError.message : individualError);
        }
      }
    }

    pendingBatch = [];
  };

  for await (const entity of readWikidataJsonDump({
    filePath: options.filePath,
    skip: resumeSkip,
    limit: options.limit,
  })) {
    scannedCount += 1;

    if (isHumanWithBirthDate(entity)) {
      matchedCount += 1;
      pendingBatch.push({ entity });

      if (pendingBatch.length >= batchSize) {
        await flushBatch();
      }
    }

    if (scannedCount % options.progressEvery === 0) {
      await flushBatch(); // 진행 로그 시점에 배치 flush
      logProgress(startTime, startScanned, scannedCount, matchedCount, importedCount, failedCount);
    }

    if (checkpointEvery > 0 && scannedCount % checkpointEvery === 0) {
      saveCheckpoint(options.filePath, { scannedCount, matchedCount, importedCount, failedCount });
    }
  }

  // 마지막 남은 배치 처리
  await flushBatch();

  // 완료 시 checkpoint 삭제
  deleteCheckpoint(options.filePath);
  console.log("[checkpoint] Import complete. Checkpoint removed.");

  return {
    scannedCount,
    matchedCount,
    importedCount,
    failedCount,
  };
}

function logProgress(
  startTime: number,
  startScanned: number,
  scannedCount: number,
  matchedCount: number,
  importedCount: number,
  failedCount: number,
): void {
  const elapsedMs = Date.now() - startTime;
  const sessionScanned = scannedCount - startScanned;
  const itemsPerSec = sessionScanned > 0 ? Math.round((sessionScanned / elapsedMs) * 1000) : 0;

  const progressPct = ((scannedCount / WIKIDATA_TOTAL_ENTITIES) * 100).toFixed(1);
  const remaining = WIKIDATA_TOTAL_ENTITIES - scannedCount;
  const etaSec = itemsPerSec > 0 ? Math.round(remaining / itemsPerSec) : null;
  const etaStr = etaSec !== null ? formatDuration(etaSec) : "계산중";
  const elapsed = formatDuration(Math.round(elapsedMs / 1000));
  const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  console.log(
    `[${now}] dump progress ${progressPct}% | scanned=${scannedCount.toLocaleString()} | matched=${matchedCount.toLocaleString()} | imported=${importedCount.toLocaleString()} | failed=${failedCount} | ${itemsPerSec.toLocaleString()}items/s | elapsed=${elapsed} | ETA=${etaStr}`,
  );
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m${s}s`;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h${m}m`;
}
