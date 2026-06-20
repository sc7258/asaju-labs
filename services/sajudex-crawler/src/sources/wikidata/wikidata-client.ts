import axios, { AxiosInstance } from "axios";

export interface WikidataClientOptions {
  apiBaseUrl: string;
  userAgent: string;
}

export interface WikidataEntityResponse {
  entities?: Record<string, WikidataEntity>;
  success?: number;
}

export interface WikidataEntity {
  id: string;
  type?: string;
  lastrevid?: number;
  modified?: string;
  labels?: Record<string, WikidataTextValue>;
  descriptions?: Record<string, WikidataTextValue>;
  claims?: Record<string, unknown[]>;
  sitelinks?: Record<string, WikidataSitelink>;
  missing?: string;
  [key: string]: unknown;
}

export interface WikidataTextValue {
  language: string;
  value: string;
}

export interface WikidataSitelink {
  site: string;
  title: string;
  badges?: string[];
  url?: string;
}

export class WikidataClient {
  private readonly http: AxiosInstance;

  constructor(private readonly options: WikidataClientOptions) {
    this.http = axios.create({
      baseURL: options.apiBaseUrl,
      headers: {
        "User-Agent": options.userAgent,
        Accept: "application/json",
      },
      timeout: 15_000,
    });
  }

  async getEntity(qid: string): Promise<WikidataEntity> {
    const entities = await this.getEntities([qid]);
    const normalizedQid = normalizeQid(qid);
    const entity = entities[normalizedQid];

    if (!entity) {
      throw new Error("Wikidata entity not found: " + normalizedQid);
    }

    return entity;
  }

  async getEntities(qids: string[]): Promise<Record<string, WikidataEntity>> {
    if (qids.length === 0) {
      return {};
    }

    const normalizedQids = [...new Set(qids.map(normalizeQid))];

    const response = await this.http.get<WikidataEntityResponse>("", {
      params: {
        action: "wbgetentities",
        ids: normalizedQids.join("|"),
        languages: "ko|en",
        props: "labels|descriptions|claims|sitelinks",
        format: "json",
        origin: "*",
      },
    });
    const entities = response.data.entities ?? {};
    const resolvedEntities: Record<string, WikidataEntity> = {};

    for (const qid of normalizedQids) {
      const entity = entities[qid];

      if (entity && !entity.missing) {
        resolvedEntities[qid] = entity;
      }
    }

    return resolvedEntities;
  }
}

export function normalizeQid(qid: string): string {
  const normalizedQid = qid.trim().toUpperCase();

  if (!/^Q\d+$/.test(normalizedQid)) {
    throw new Error("Invalid Wikidata QID: " + qid);
  }

  return normalizedQid;
}
