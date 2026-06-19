import { WikidataEntity } from "./wikidata-client";

export function isHumanWithBirthDate(entity: WikidataEntity): boolean {
  return hasClaimValue(entity, "P31", "Q5") && hasClaim(entity, "P569");
}

export function getFirstWikidataTimeValue(entity: WikidataEntity, propertyId: string): string | undefined {
  const claims = entity.claims?.[propertyId];

  if (!Array.isArray(claims)) {
    return undefined;
  }

  for (const claim of claims) {
    const value = getClaimDataValue(claim);

    if (isWikidataTimeValue(value)) {
      return value.time;
    }
  }

  return undefined;
}

function hasClaim(entity: WikidataEntity, propertyId: string): boolean {
  const claims = entity.claims?.[propertyId];
  return Array.isArray(claims) && claims.length > 0;
}

function hasClaimValue(entity: WikidataEntity, propertyId: string, qid: string): boolean {
  const claims = entity.claims?.[propertyId];

  if (!Array.isArray(claims)) {
    return false;
  }

  return claims.some((claim) => {
    const value = getClaimDataValue(claim);
    return isWikibaseEntityIdValue(value) && value.id === qid;
  });
}

function getClaimDataValue(claim: unknown): unknown {
  if (!claim || typeof claim !== "object") {
    return undefined;
  }

  const mainsnak = (claim as { mainsnak?: unknown }).mainsnak;

  if (!mainsnak || typeof mainsnak !== "object") {
    return undefined;
  }

  const datavalue = (mainsnak as { datavalue?: unknown }).datavalue;

  if (!datavalue || typeof datavalue !== "object") {
    return undefined;
  }

  return (datavalue as { value?: unknown }).value;
}

function isWikibaseEntityIdValue(value: unknown): value is { id: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function isWikidataTimeValue(value: unknown): value is { time: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { time?: unknown }).time === "string"
  );
}
