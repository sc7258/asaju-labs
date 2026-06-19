import { CrawlerEnv } from "../config/env";
import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataClient, normalizeQid } from "../sources/wikidata/wikidata-client";
import { mapWikidataEntityToRawInput } from "../sources/wikidata/wikidata-mapper";

export interface ExtractWikidataResult {
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
}

export async function extractWikidataEntities(
  qids: string[],
  env: CrawlerEnv,
  rawWikipediaRepository: RawWikipediaRepository,
): Promise<ExtractWikidataResult> {
  if (qids.length === 0) {
    throw new Error("At least one Wikidata QID is required.");
  }

  const normalizedQids = qids.map(normalizeQid);
  const wikidataClient = new WikidataClient({
    apiBaseUrl: env.wikidataApiBaseUrl,
    userAgent: env.crawlerUserAgent,
  });

  let succeededCount = 0;
  let failedCount = 0;

  for (const qid of normalizedQids) {
    try {
      const entity = await wikidataClient.getEntity(qid);
      const rawInput = mapWikidataEntityToRawInput(entity);
      const rawRow = await rawWikipediaRepository.upsert(rawInput);

      succeededCount += 1;
      console.log(
        "Saved " + qid + ": raw_wikipedia.id=" + rawRow.id + ", title=" + rawRow.title,
      );
    } catch (error) {
      failedCount += 1;
      console.error("Failed to extract " + qid + ":", error);
    }
  }

  return {
    requestedCount: qids.length,
    succeededCount,
    failedCount,
  };
}
