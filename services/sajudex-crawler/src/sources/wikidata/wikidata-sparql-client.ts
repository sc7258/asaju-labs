import axios, { AxiosInstance } from "axios";

import { DiscoveredWikidataPersonSeed } from "../../repositories/wikidata-people-seed-repository";

export interface WikidataSparqlClientOptions {
  endpoint: string;
  userAgent: string;
}

interface SparqlBindingValue {
  type: string;
  value: string;
}

interface PeopleDiscoveryBinding {
  person: SparqlBindingValue;
  personLabel?: SparqlBindingValue;
  personDescription?: SparqlBindingValue;
  birthDate?: SparqlBindingValue;
}

interface SparqlResponse {
  results: {
    bindings: PeopleDiscoveryBinding[];
  };
}

export class WikidataSparqlClient {
  private readonly http: AxiosInstance;

  constructor(private readonly options: WikidataSparqlClientOptions) {
    this.http = axios.create({
      baseURL: options.endpoint,
      headers: {
        "User-Agent": options.userAgent,
        Accept: "application/sparql-results+json",
      },
      timeout: 60_000,
    });
  }

  async discoverPeopleWithBirthDate(limit: number, offset: number): Promise<DiscoveredWikidataPersonSeed[]> {
    const response = await this.http.get<SparqlResponse>("", {
      params: {
        query: buildPeopleWithBirthDateQuery(limit, offset),
        format: "json",
      },
    });

    return response.data.results.bindings.map(mapBindingToSeed);
  }
}

function buildPeopleWithBirthDateQuery(limit: number, offset: number): string {
  return [
    "SELECT DISTINCT ?person ?birthDate WHERE {",
    "  ?person wdt:P31 wd:Q5 .",
    "  ?person wdt:P569 ?birthDate .",
    "}",
    "LIMIT " + limit,
    "OFFSET " + offset,
  ].join("\n");
}

function mapBindingToSeed(binding: PeopleDiscoveryBinding): DiscoveredWikidataPersonSeed {
  return {
    wikidataId: parseQidFromEntityUrl(binding.person.value),
    label: binding.personLabel?.value,
    description: binding.personDescription?.value,
    birthDate: binding.birthDate?.value,
  };
}

function parseQidFromEntityUrl(entityUrl: string): string {
  const qid = entityUrl.split("/").at(-1);

  if (!qid || !/^Q\d+$/.test(qid)) {
    throw new Error("Unexpected Wikidata entity URL: " + entityUrl);
  }

  return qid;
}
