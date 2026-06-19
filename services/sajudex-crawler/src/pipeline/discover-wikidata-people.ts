import { CrawlerEnv } from "../config/env";
import { WikidataPeopleSeedRepository } from "../repositories/wikidata-people-seed-repository";
import { WikidataSparqlClient } from "../sources/wikidata/wikidata-sparql-client";

export interface DiscoverWikidataPeopleOptions {
  limit: number;
  offset: number;
}

export interface DiscoverWikidataPeopleResult {
  discoveredCount: number;
  upsertedCount: number;
}

export async function discoverWikidataPeople(
  options: DiscoverWikidataPeopleOptions,
  env: CrawlerEnv,
  seedRepository: WikidataPeopleSeedRepository,
): Promise<DiscoverWikidataPeopleResult> {
  const sparqlClient = new WikidataSparqlClient({
    endpoint: env.wikidataSparqlEndpoint,
    userAgent: env.crawlerUserAgent,
  });

  const seeds = await sparqlClient.discoverPeopleWithBirthDate(options.limit, options.offset);
  const upsertedCount = await seedRepository.upsertDiscoveredMany(seeds);

  return {
    discoveredCount: seeds.length,
    upsertedCount,
  };
}
