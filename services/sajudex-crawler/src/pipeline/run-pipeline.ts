import { PrismaClient } from "@repo/db-schema";

import { CrawlerEnv } from "../config/env";
import { CrawlerRunRepository } from "../repositories/crawler-run-repository";
import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataPeopleSeedRepository } from "../repositories/wikidata-people-seed-repository";
import {
  discoverWikidataPeople,
  DiscoverWikidataPeopleResult,
} from "./discover-wikidata-people";
import {
  extractPendingWikidataSeeds,
  ExtractPendingWikidataResult,
} from "./extract-pending-wikidata";
import {
  transformPendingWikidataRawRows,
  TransformWikidataResult,
} from "./transform-wikidata";

export interface RunWikidataPipelineOptions {
  limit: number;
  offset: number;
}

export interface RunWikidataPipelineResult {
  discovery: DiscoverWikidataPeopleResult;
  extraction: ExtractPendingWikidataResult;
  transform: TransformWikidataResult;
}

export async function runWikidataPipeline(
  options: RunWikidataPipelineOptions,
  env: CrawlerEnv,
  db: PrismaClient,
): Promise<RunWikidataPipelineResult> {
  const seedRepository = new WikidataPeopleSeedRepository(db);
  const rawWikipediaRepository = new RawWikipediaRepository(db);

  const discovery = await discoverWikidataPeople(
    {
      limit: options.limit,
      offset: options.offset,
    },
    env,
    seedRepository,
  );
  const extraction = await extractPendingWikidataSeeds(
    options.limit,
    env,
    seedRepository,
    rawWikipediaRepository,
  );
  const transform = await transformPendingWikidataRawRows(options.limit, env, db);

  return {
    discovery,
    extraction,
    transform,
  };
}

export async function runLoggedWikidataPipeline(
  command: string,
  options: RunWikidataPipelineOptions,
  env: CrawlerEnv,
  db: PrismaClient,
): Promise<RunWikidataPipelineResult> {
  const crawlerRunRepository = new CrawlerRunRepository(db);
  const run = await crawlerRunRepository.start(command);

  try {
    const result = await runWikidataPipeline(options, env, db);
    const failedCount = result.extraction.failedCount + result.transform.failedCount;
    const status =
      failedCount > 0
        ? result.extraction.succeededCount > 0 || result.transform.succeededCount > 0
          ? "PARTIAL"
          : "FAILED"
        : "SUCCEEDED";

    await crawlerRunRepository.finish(run.id, {
      status,
      requestedCount:
        result.discovery.discoveredCount +
        result.extraction.requestedCount +
        result.transform.requestedCount,
      succeededCount:
        result.discovery.upsertedCount +
        result.extraction.succeededCount +
        result.transform.succeededCount,
      failedCount,
      skippedCount: result.transform.skippedCount,
      message:
        "discovery_upserted=" +
        result.discovery.upsertedCount +
        ", extract_succeeded=" +
        result.extraction.succeededCount +
        ", transform_succeeded=" +
        result.transform.succeededCount,
    });

    return result;
  } catch (error) {
    await crawlerRunRepository.finish(run.id, {
      status: "FAILED",
      requestedCount: 0,
      succeededCount: 0,
      failedCount: 1,
      skippedCount: 0,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
