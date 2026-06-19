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

  for (const seed of seeds) {
    try {
      await seedRepository.markFetching(seed.id);
      const entity = await wikidataClient.getEntity(seed.wikidataId);
      const rawRow = await rawWikipediaRepository.upsert(mapWikidataEntityToRawInput(entity));
      await seedRepository.markFetched(seed.id, rawRow.id);

      succeededCount += 1;
      console.log("Fetched " + seed.wikidataId + ": raw_wikipedia.id=" + rawRow.id);
    } catch (error) {
      failedCount += 1;
      await seedRepository.markFailed(seed.id, error);
      console.error("Failed to fetch " + seed.wikidataId + ":", error);
    }
  }

  return {
    requestedCount: seeds.length,
    succeededCount,
    failedCount,
  };
}
