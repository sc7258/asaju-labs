import path from "node:path";

import dotenv from "dotenv";

export interface CrawlerEnv {
  databaseUrl: string;
  wikidataApiBaseUrl: string;
  wikidataSparqlEndpoint: string;
  crawlerUserAgent: string;
  crawlerBatchSize: number;
  crawlerMaxRetries: number;
  crawlerCron: string;
}

let cachedEnv: CrawlerEnv | undefined;

export function loadCrawlerEnv(): CrawlerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  loadDotenvFiles();

  cachedEnv = {
    databaseUrl: readRequiredEnv("DATABASE_URL"),
    wikidataApiBaseUrl:
      process.env.WIKIDATA_API_BASE_URL ??
      "https://www.wikidata.org/w/api.php",
    wikidataSparqlEndpoint:
      process.env.WIKIDATA_SPARQL_ENDPOINT ??
      "https://query.wikidata.org/sparql",
    crawlerUserAgent:
      process.env.CRAWLER_USER_AGENT ??
      "asaju-labs/sajudex-crawler contact@example.com",
    crawlerBatchSize: readPositiveIntegerEnv("CRAWLER_BATCH_SIZE", 100),
    crawlerMaxRetries: readPositiveIntegerEnv("CRAWLER_MAX_RETRIES", 3),
    crawlerCron: process.env.CRAWLER_CRON ?? "0 3 * * *",
  };

  return cachedEnv;
}

function loadDotenvFiles(): void {
  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of candidatePaths) {
    dotenv.config({ path: envPath, override: true });
  }
}

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}
