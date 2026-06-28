import { CrawlerEnv } from "../config/env";
import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataPeopleSeedRepository } from "../repositories/wikidata-people-seed-repository";
import { WikidataClient } from "../sources/wikidata/wikidata-client";
import { mapWikidataEntityToRawInput } from "../sources/wikidata/wikidata-mapper";

export interface ExtractPendingWikidataResult {
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
}

export async function extractPendingWikidataSeeds(
  limit: number,
  env: CrawlerEnv,
  seedRepository: WikidataPeopleSeedRepository,
  rawWikipediaRepository: RawWikipediaRepository,
): Promise<ExtractPendingWikidataResult> {
  const seeds = await seedRepository.findPending(limit);
  const wikidataClient = new WikidataClient({
    apiBaseUrl: env.wikidataApiBaseUrl,
    userAgent: env.crawlerUserAgent,
  });

  let succeededCount = 0;
  let failedCount = 0;

  // Split seeds into chunks of 50 (Wikidata API limit)
  const chunkSize = 50;
  for (let i = 0; i < seeds.length; i += chunkSize) {
    const chunk = seeds.slice(i, i + chunkSize);
    const qids = chunk.map((s) => s.wikidataId);
    
    try {
      // Mark all as fetching
      await Promise.all(chunk.map(seed => seedRepository.markFetching(seed.id)));
      
      // Fetch in batch
      const entities = await wikidataClient.getEntities(qids);
      
      for (const seed of chunk) {
        const entity = entities[seed.wikidataId];
        if (entity) {
          const rawRow = await rawWikipediaRepository.upsert(mapWikidataEntityToRawInput(entity));
          await seedRepository.markFetched(seed.id, rawRow.id);
          succeededCount += 1;
        } else {
          await seedRepository.markFailed(seed.id, new Error("Entity not found or missing"));
          failedCount += 1;
        }
      }
      console.log(`Fetched chunk of ${chunk.length} items. Total succeeded: ${succeededCount}`);
      
      // Add a 2-second delay between chunks to respect Wikidata API rate limits (avoid 429 Too Many Requests)
      if (i + chunkSize < seeds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      // If the entire chunk fails (e.g. rate limit), mark all as failed
      console.error(`Failed to fetch chunk (QIDs: ${qids[0]}...):`, error);
      for (const seed of chunk) {
        await seedRepository.markFailed(seed.id, error);
        failedCount += 1;
      }
      
      // Add a 5-second delay on error before the next chunk
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return {
    requestedCount: seeds.length,
    succeededCount,
    failedCount,
  };
}
