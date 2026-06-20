import { PrismaClient } from "@repo/db-schema";

import { CrawlerEnv } from "../config/env";
import { CuratedPersonRepository } from "../repositories/curated-person-repository";
import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataClient } from "../sources/wikidata/wikidata-client";
import { WikidataEntityReferenceResolver } from "../sources/wikidata/wikidata-entity-reference-resolver";
import { transformRawWikipediaToCuratedPerson } from "../sources/wikidata/wikidata-transformer";

export interface TransformWikidataResult {
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
}

export async function transformPendingWikidataRawRows(
  limit: number,
  env: CrawlerEnv,
  db: PrismaClient,
): Promise<TransformWikidataResult> {
  const rawWikipediaRepository = new RawWikipediaRepository(db);
  const wikidataClient = new WikidataClient({
    apiBaseUrl: env.wikidataApiBaseUrl,
    userAgent: env.crawlerUserAgent,
  });
  const referenceResolver = new WikidataEntityReferenceResolver(wikidataClient);
  const candidates = await rawWikipediaRepository.findPendingForTransform(limit);

  let succeededCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const rawRow of candidates) {
    try {
      const transformed = await transformRawWikipediaToCuratedPerson(
        rawRow,
        referenceResolver,
      );

      if (transformed.processStatus === "PROCESSED_WITHOUT_BIRTH_DATE") {
        await rawWikipediaRepository.markProcessedWithoutBirthDate(rawRow.id);
        skippedCount += 1;
        console.log("Skipped " + rawRow.wikidataId + ": no usable birth date in raw JSON");
        continue;
      }

      await db.$transaction(async (tx) => {
        const txCuratedPersonRepository = new CuratedPersonRepository(tx);
        const txRawWikipediaRepository = new RawWikipediaRepository(tx);

        await txCuratedPersonRepository.upsert(transformed.curatedPerson);
        await txRawWikipediaRepository.markProcessed(rawRow.id);
      });

      succeededCount += 1;
      console.log("Transformed " + rawRow.wikidataId + ": curated_people upserted");
    } catch (error) {
      failedCount += 1;
      await rawWikipediaRepository.markFailedRetryable(rawRow.id, error);
      console.error("Failed to transform " + rawRow.wikidataId + ":", error);
    }
  }

  return {
    requestedCount: candidates.length,
    succeededCount,
    failedCount,
    skippedCount,
  };
}
