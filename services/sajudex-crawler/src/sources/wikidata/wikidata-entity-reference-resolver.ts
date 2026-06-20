import { WikidataClient, WikidataEntity } from "./wikidata-client";

export class WikidataEntityReferenceResolver {
  private readonly entityCache = new Map<string, WikidataEntity | null>();

  constructor(private readonly wikidataClient: WikidataClient) {}

  async resolveLabel(qid: string | null | undefined): Promise<string | null> {
    const entity = await this.resolveEntity(qid);
    return entity ? pickEntityLabel(entity) : null;
  }

  async resolveEntity(qid: string | null | undefined): Promise<WikidataEntity | null> {
    if (!qid) {
      return null;
    }

    if (!this.entityCache.has(qid)) {
      try {
        const entities = await this.wikidataClient.getEntities([qid]);
        this.entityCache.set(qid, entities[qid] ?? null);
      } catch {
        this.entityCache.set(qid, null);
      }
    }

    return this.entityCache.get(qid) ?? null;
  }
}

export function pickEntityLabel(entity: WikidataEntity): string | null {
  return (
    normalizeOptionalText(entity.labels?.ko?.value) ??
    normalizeOptionalText(entity.sitelinks?.kowiki?.title) ??
    normalizeOptionalText(entity.labels?.en?.value) ??
    normalizeOptionalText(entity.sitelinks?.enwiki?.title) ??
    normalizeOptionalText(entity.id) ??
    null
  );
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
