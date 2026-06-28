import { PrismaClient } from "@repo/db-schema";

import { CrawlerEnv } from "../config/env";
import { CuratedPersonRepository } from "../repositories/curated-person-repository";
import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataClient } from "../sources/wikidata/wikidata-client";
import { WikidataEntityReferenceResolver } from "../sources/wikidata/wikidata-entity-reference-resolver";
import { extractRequiredQids, transformRawWikipediaToCuratedPerson } from "../sources/wikidata/wikidata-transformer";

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

  // --- PRELOAD PHASE ---
  const initialQids = new Set<string>();
  for (const rawRow of candidates) {
    for (const qid of extractRequiredQids(rawRow)) {
      initialQids.add(qid);
    }
  }
  
  if (initialQids.size > 0) {
    console.log(`Preloading ${initialQids.size} QIDs...`);
    await referenceResolver.preloadEntities(Array.from(initialQids));
    
    // Stage 2: Extract P17 from resolved P19 entities
    const countryQids = new Set<string>();
    for (const qid of initialQids) {
      const entity = await referenceResolver.resolveEntity(qid);
      if (entity && entity.claims?.["P17"]) {
        const claims = entity.claims["P17"];
        if (Array.isArray(claims)) {
          for (const claim of claims) {
            const mainsnak = (claim as any).mainsnak;
            if (mainsnak?.datavalue?.value?.id) {
              countryQids.add(mainsnak.datavalue.value.id);
            }
          }
        }
      }
    }
    if (countryQids.size > 0) {
      console.log(`Preloading ${countryQids.size} country QIDs...`);
      await referenceResolver.preloadEntities(Array.from(countryQids));
    }
  }
  // ---------------------

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
