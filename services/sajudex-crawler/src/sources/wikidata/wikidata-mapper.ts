import crypto from "node:crypto";

import { Prisma } from "@repo/db-schema";

import { UpsertRawWikipediaInput } from "../../repositories/raw-wikipedia-repository";
import { WikidataEntity } from "./wikidata-client";

export function mapWikidataEntityToRawInput(entity: WikidataEntity): UpsertRawWikipediaInput {
  const displayTitle = pickTitle(entity);

  return {
    wikidataId: entity.id,
    title: displayTitle,
    language: "ko",
    sourceUrl: "https://www.wikidata.org/wiki/" + entity.id,
    rawJson: entity as Prisma.InputJsonValue,
    rawHash: hashJson(entity),
    rawRevisionId: entity.lastrevid ? String(entity.lastrevid) : undefined,
  };
}

function pickTitle(entity: WikidataEntity): string {
  return (
    entity.labels?.ko?.value ??
    entity.sitelinks?.kowiki?.title ??
    entity.labels?.en?.value ??
    entity.sitelinks?.enwiki?.title ??
    entity.id
  );
}

function hashJson(value: unknown): string {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, sortJsonValue(nestedValue)]),
    );
  }

  return value;
}
