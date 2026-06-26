import { loadCrawlerEnv } from "./config/env";
import { disconnectPrisma, prisma } from "./db/client";
import { discoverWikidataPeople } from "./pipeline/discover-wikidata-people";
import { extractPendingWikidataSeeds } from "./pipeline/extract-pending-wikidata";
import { extractWikidataEntities } from "./pipeline/extract-wikidata";
import { importWikidataJsonDump } from "./pipeline/import-wikidata-json-dump";
import { RawWikipediaRepository } from "./repositories/raw-wikipedia-repository";
import { startCrawlerSchedule } from "./scheduler/cron";
import { WikidataPeopleSeedRepository } from "./repositories/wikidata-people-seed-repository";

let shouldDisconnectPrismaOnExit = true;

async function main(): Promise<void> {
  const [command, ...args] = process.argv
    .slice(2)
    .filter((arg) => arg !== "--");

  switch (command) {
    case "db:check":
      await checkDatabase();
      break;
    case "discover:wikidata:people":
      await discoverPeople(args);
      break;
    case "extract:wikidata":
      await extractWikidata(args);
      break;
    case "extract:wikidata:pending":
      await extractPendingWikidata(args);
      break;
    case "import:wikidata:json-dump":
      await importJsonDump(args);
      break;
    case "transform:wikidata":
      await transformWikidata(args);
      break;
    case "run:pipeline":
      await runPipeline(args);
      break;
    case "schedule":
      await schedulePipeline(args);
      break;
    default:
      console.log("Sajudex Crawler Initialized");
      console.log(
        "Available commands: db:check, import:wikidata:json-dump, discover:wikidata:people, extract:wikidata <qid...>, extract:wikidata:pending, transform:wikidata, run:pipeline, schedule",
      );
  }
}

async function checkDatabase(): Promise<void> {
  const rawWikipediaRepository = new RawWikipediaRepository(prisma);
  const seedRepository = new WikidataPeopleSeedRepository(prisma);
  const rawWikipediaCount = await rawWikipediaRepository.count();
  const seedCounts = await seedRepository.countByStatus();

  console.log("Database connection OK. raw_wikipedia rows: " + rawWikipediaCount);
  console.log(
    "wikidata_people_seeds: " +
      seedCounts.map((row) => row.status + "=" + row.count).join(", "),
  );
}

async function discoverPeople(args: string[]): Promise<void> {
  const env = loadCrawlerEnv();
  const seedRepository = new WikidataPeopleSeedRepository(prisma);
  const limit = readNumberOption(args, "--limit", env.crawlerBatchSize);
  const offset = readNumberOption(args, "--offset", 0);
  const result = await discoverWikidataPeople({ limit, offset }, env, seedRepository);

  console.log(
    "Wikidata people discovery finished. discovered=" +
      result.discoveredCount +
      ", upserted=" +
      result.upsertedCount +
      ", limit=" +
      limit +
      ", offset=" +
      offset,
  );
}

async function extractWikidata(qids: string[]): Promise<void> {
  const env = loadCrawlerEnv();
  const rawWikipediaRepository = new RawWikipediaRepository(prisma);
  const result = await extractWikidataEntities(qids, env, rawWikipediaRepository);

  console.log(
    "Wikidata extract finished. requested=" +
      result.requestedCount +
      ", succeeded=" +
      result.succeededCount +
      ", failed=" +
      result.failedCount,
  );

  if (result.failedCount > 0) {
    process.exitCode = 1;
  }
}

async function extractPendingWikidata(args: string[]): Promise<void> {
  const env = loadCrawlerEnv();
  const limit = readNumberOption(args, "--limit", env.crawlerBatchSize);
  const seedRepository = new WikidataPeopleSeedRepository(prisma);
  const rawWikipediaRepository = new RawWikipediaRepository(prisma);
  const result = await extractPendingWikidataSeeds(
    limit,
    env,
    seedRepository,
    rawWikipediaRepository,
  );

  console.log(
    "Pending Wikidata extract finished. requested=" +
      result.requestedCount +
      ", succeeded=" +
      result.succeededCount +
      ", failed=" +
      result.failedCount,
  );

  if (result.failedCount > 0) {
    process.exitCode = 1;
  }
}

async function importJsonDump(args: string[]): Promise<void> {
  const filePath = readStringOption(args, "--file");
  const limit = readOptionalNumberOption(args, "--limit");
  const skip = readOptionalNumberOption(args, "--skip") ?? 0;
  const progressEvery = readNumberOption(args, "--progress-every", 10_000);
  const checkpointEvery = readOptionalNumberOption(args, "--checkpoint-every");
  const batchSize = readOptionalNumberOption(args, "--batch-size");
  const resetCheckpoint = args.includes("--reset-checkpoint");
  const rawWikipediaRepository = new RawWikipediaRepository(prisma);
  const seedRepository = new WikidataPeopleSeedRepository(prisma);
  const result = await importWikidataJsonDump(
    {
      filePath,
      limit,
      skip,
      progressEvery,
      checkpointEvery,
      batchSize,
      resetCheckpoint,
    },
    rawWikipediaRepository,
    seedRepository,
  );

  console.log(
    "Wikidata JSON dump import finished. scanned=" +
      result.scannedCount +
      ", matched=" +
      result.matchedCount +
      ", imported=" +
      result.importedCount +
      ", failed=" +
      result.failedCount,
  );

  if (result.failedCount > 0) {
    process.exitCode = 1;
  }
}

async function transformWikidata(args: string[]): Promise<void> {
  const { transformPendingWikidataRawRows } = await import("./pipeline/transform-wikidata.js");
  const env = loadCrawlerEnv();
  const limit = readNumberOption(args, "--limit", env.crawlerBatchSize);
  const result = await transformPendingWikidataRawRows(limit, env, prisma);

  console.log(
    "Wikidata transform finished. requested=" +
      result.requestedCount +
      ", succeeded=" +
      result.succeededCount +
      ", skipped=" +
      result.skippedCount +
      ", failed=" +
      result.failedCount,
  );

  if (result.failedCount > 0) {
    process.exitCode = 1;
  }
}

async function runPipeline(args: string[]): Promise<void> {
  const { runLoggedWikidataPipeline } = await import("./pipeline/run-pipeline.js");
  const env = loadCrawlerEnv();
  const limit = readNumberOption(args, "--limit", env.crawlerBatchSize);
  const offset = readNumberOption(args, "--offset", 0);
  const result = await runLoggedWikidataPipeline(
    "run:pipeline",
    { limit, offset },
    env,
    prisma,
  );

  console.log(
    "Wikidata pipeline finished. discovery_upserted=" +
      result.discovery.upsertedCount +
      ", extract_succeeded=" +
      result.extraction.succeededCount +
      ", extract_failed=" +
      result.extraction.failedCount +
      ", transform_succeeded=" +
      result.transform.succeededCount +
      ", transform_skipped=" +
      result.transform.skippedCount +
      ", transform_failed=" +
      result.transform.failedCount,
  );

  if (result.extraction.failedCount > 0 || result.transform.failedCount > 0) {
    process.exitCode = 1;
  }
}

async function schedulePipeline(args: string[]): Promise<void> {
  const { runLoggedWikidataPipeline } = await import("./pipeline/run-pipeline.js");
  const env = loadCrawlerEnv();
  const limit = readNumberOption(args, "--limit", env.crawlerBatchSize);
  const offset = readNumberOption(args, "--offset", 0);
  const task = startCrawlerSchedule(env.crawlerCron, async () => {
    const result = await runLoggedWikidataPipeline(
      "schedule",
      { limit, offset },
      env,
      prisma,
    );

    console.log(
      "Scheduled Wikidata pipeline finished. discovery_upserted=" +
        result.discovery.upsertedCount +
        ", extract_succeeded=" +
        result.extraction.succeededCount +
        ", transform_succeeded=" +
        result.transform.succeededCount,
      );
  });
  shouldDisconnectPrismaOnExit = false;

  console.log(
    "Wikidata scheduler started. cron=" +
      env.crawlerCron +
      ", limit=" +
      limit +
      ", offset=" +
      offset,
  );

  await new Promise<void>((resolve) => {
    const stop = async () => {
      task.stop();
      await disconnectPrisma();
      resolve();
    };

    process.once("SIGINT", () => {
      void stop();
    });
    process.once("SIGTERM", () => {
      void stop();
    });
  });
}

function readStringOption(args: string[], name: string): string {
  const index = args.indexOf(name);
  const value = index === -1 ? undefined : args[index + 1];

  if (!value) {
    throw new Error(name + " is required.");
  }

  return value;
}

function readOptionalNumberOption(args: string[], name: string): number | undefined {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return parseNumberOptionValue(args[index + 1], name);
}

function readNumberOption(args: string[], name: string, fallback: number): number {
  const index = args.indexOf(name);

  if (index === -1) {
    return fallback;
  }

  return parseNumberOptionValue(args[index + 1], name);
}

function parseNumberOptionValue(rawValue: string | undefined, name: string): number {
  const value = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(name + " must be a non-negative integer.");
  }

  return value;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (shouldDisconnectPrismaOnExit) {
      await disconnectPrisma();
    }
  });
