import {
  BirthCalendarStatus,
  BirthDatePrecision,
  RawWikipedia,
} from "@repo/db-schema";

import { calculateSajuPillarsForSolarDate } from "../../domain/saju-pillar-calculator";
import { UpsertCuratedPersonInput } from "../../repositories/curated-person-repository";
import { WikidataEntity } from "./wikidata-client";
import { WikidataEntityReferenceResolver } from "./wikidata-entity-reference-resolver";

type ParsedDatePrecision = BirthDatePrecision;

interface ParsedWikidataDate {
  year: number;
  month: number | null;
  day: number | null;
  precision: ParsedDatePrecision;
}

export type TransformWikidataRowResult =
  | {
      processStatus: "PROCESSED";
      curatedPerson: UpsertCuratedPersonInput;
    }
  | {
      processStatus: "PROCESSED_WITHOUT_BIRTH_DATE";
    };

export async function transformRawWikipediaToCuratedPerson(
  rawRow: RawWikipedia,
  referenceResolver?: WikidataEntityReferenceResolver,
): Promise<TransformWikidataRowResult> {
  const entity = parseRawWikidataEntity(rawRow);
  const birthDateClaim = getFirstDateClaim(entity, "P569");

  if (!birthDateClaim) {
    return {
      processStatus: "PROCESSED_WITHOUT_BIRTH_DATE",
    };
  }

  const displayName = pickDisplayName(entity, rawRow.title);
  const deathDateClaim = getFirstDateClaim(entity, "P570");
  const citizenshipCountryName = await getFirstResolvedEntityLabel(
    entity,
    "P27",
    referenceResolver,
  );
  const birthPlaceQid = getFirstEntityIdClaim(entity, "P19");
  const birthPlaceName = await resolveEntityLabelFromQid(
    birthPlaceQid,
    referenceResolver,
  );
  const birthCountryName = await resolveBirthCountryName(
    birthPlaceQid,
    referenceResolver,
  );
  const occupationName = await getFirstResolvedEntityLabel(
    entity,
    "P106",
    referenceResolver,
  );
  const curatedPerson: UpsertCuratedPersonInput = {
    displayName,
    sortName: normalizeOptionalText(entity.labels?.en?.value) ?? displayName,
    birthYear: birthDateClaim.year,
    birthMonth: birthDateClaim.month,
    birthDay: birthDateClaim.day,
    birthPrecision: birthDateClaim.precision,
    birthCalendarStatus: resolveBirthCalendarStatus(birthDateClaim),
    deathYear: deathDateClaim?.year ?? null,
    deathMonth: deathDateClaim?.month ?? null,
    deathDay: deathDateClaim?.day ?? null,
    citizenshipCountryName,
    birthPlaceName,
    birthCountryName,
    occupationName,
    source: "WIKIDATA",
    sourceId: entity.id,
    sourceUrl: rawRow.sourceUrl,
    rawWikipediaId: rawRow.id,
    sajuYearStem: null,
    sajuYearBranch: null,
    sajuMonthStem: null,
    sajuMonthBranch: null,
    sajuDayStem: null,
    sajuDayBranch: null,
    sajuComputedAt: null,
  };

  if (
    birthDateClaim.precision === "DAY" &&
    birthDateClaim.month !== null &&
    birthDateClaim.day !== null
  ) {
    try {
      const saju = await calculateSajuPillarsForSolarDate({
        year: birthDateClaim.year,
        month: birthDateClaim.month,
        day: birthDateClaim.day,
      });

      curatedPerson.sajuYearStem = saju.yearStem;
      curatedPerson.sajuYearBranch = saju.yearBranch;
      curatedPerson.sajuMonthStem = saju.monthStem;
      curatedPerson.sajuMonthBranch = saju.monthBranch;
      curatedPerson.sajuDayStem = saju.dayStem;
      curatedPerson.sajuDayBranch = saju.dayBranch;
      curatedPerson.sajuComputedAt = new Date();
    } catch {
      // Historical dates outside the current calculator range should not block loading.
    }
  }

  return {
    processStatus: "PROCESSED",
    curatedPerson,
  };
}

function parseRawWikidataEntity(rawRow: RawWikipedia): WikidataEntity {
  const rawJson = rawRow.rawJson as unknown;

  if (!rawJson || typeof rawJson !== "object") {
    throw new Error("raw_wikipedia.raw_json is not a valid object for row " + rawRow.id);
  }

  const entity = rawJson as Partial<WikidataEntity>;

  if (typeof entity.id !== "string" || entity.id.length === 0) {
    throw new Error("raw_wikipedia.raw_json is missing entity.id for row " + rawRow.id);
  }

  return entity as WikidataEntity;
}

function pickDisplayName(entity: WikidataEntity, fallbackTitle: string): string {
  return (
    normalizeOptionalText(entity.labels?.ko?.value) ??
    normalizeOptionalText(entity.sitelinks?.kowiki?.title) ??
    normalizeOptionalText(entity.labels?.en?.value) ??
    normalizeOptionalText(entity.sitelinks?.enwiki?.title) ??
    fallbackTitle
  );
}

function resolveBirthCalendarStatus(
  birthDateClaim: ParsedWikidataDate,
): BirthCalendarStatus {
  if (birthDateClaim.precision === "UNKNOWN") {
    return "UNKNOWN";
  }

  return "SOLAR_ASSUMED";
}

function getFirstDateClaim(
  entity: WikidataEntity,
  propertyId: string,
): ParsedWikidataDate | undefined {
  const claims = entity.claims?.[propertyId];

  if (!Array.isArray(claims)) {
    return undefined;
  }

  for (const claim of claims) {
    const value = getClaimDataValue(claim);

    if (isWikidataTimeValue(value)) {
      const parsed = parseWikidataDate(value.time, value.precision);

      if (parsed) {
        return parsed;
      }
    }
  }

  return undefined;
}

function getFirstTextClaim(entity: WikidataEntity, propertyId: string): string | null {
  const claims = entity.claims?.[propertyId];

  if (!Array.isArray(claims)) {
    return null;
  }

  for (const claim of claims) {
    const value = getClaimDataValue(claim);

    if (typeof value === "string") {
      return normalizeOptionalText(value) ?? null;
    }

    if (isWikidataTextValue(value)) {
      return normalizeOptionalText(value.text) ?? null;
    }
  }

  return null;
}

async function getFirstResolvedEntityLabel(
  entity: WikidataEntity,
  propertyId: string,
  referenceResolver?: WikidataEntityReferenceResolver,
): Promise<string | null> {
  const entityId = getFirstEntityIdClaim(entity, propertyId);

  if (entityId && referenceResolver) {
    const resolved = await referenceResolver.resolveLabel(entityId);

    if (resolved) {
      return resolved;
    }
  }

  return getFirstTextClaim(entity, propertyId);
}

function getFirstEntityIdClaim(entity: WikidataEntity, propertyId: string): string | null {
  const claims = entity.claims?.[propertyId];

  if (!Array.isArray(claims)) {
    return null;
  }

  for (const claim of claims) {
    const value = getClaimDataValue(claim);

    if (isWikibaseEntityIdValue(value)) {
      return normalizeOptionalText(value.id) ?? null;
    }
  }

  return null;
}

async function resolveEntityLabelFromQid(
  qid: string | null,
  referenceResolver?: WikidataEntityReferenceResolver,
): Promise<string | null> {
  if (!qid || !referenceResolver) {
    return null;
  }

  return referenceResolver.resolveLabel(qid);
}

async function resolveBirthCountryName(
  birthPlaceQid: string | null,
  referenceResolver?: WikidataEntityReferenceResolver,
): Promise<string | null> {
  if (!birthPlaceQid || !referenceResolver) {
    return null;
  }

  const birthPlaceEntity = await referenceResolver.resolveEntity(birthPlaceQid);

  if (!birthPlaceEntity) {
    return null;
  }

  const countryQid = getFirstEntityIdClaim(birthPlaceEntity, "P17");

  if (!countryQid) {
    return null;
  }

  return referenceResolver.resolveLabel(countryQid);
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

function parseWikidataDate(
  rawTime: string,
  precisionValue: number | undefined,
): ParsedWikidataDate | undefined {
  const match = /^([+-]?\d+)-(\d{2})-(\d{2})T/.exec(rawTime);

  if (!match) {
    return undefined;
  }

  const rawYear = match[1];
  const rawMonth = match[2];
  const rawDay = match[3];

  if (!rawYear || !rawMonth || !rawDay) {
    return undefined;
  }

  const year = Number.parseInt(rawYear, 10);
  const parsedMonth = Number.parseInt(rawMonth, 10);
  const parsedDay = Number.parseInt(rawDay, 10);

  if (!Number.isInteger(year)) {
    return undefined;
  }

  const precision = resolveBirthPrecision(precisionValue);
  const month = parsedMonth > 0 ? parsedMonth : null;
  const day = parsedDay > 0 ? parsedDay : null;

  if (precision === "DAY" && (month === null || day === null)) {
    return undefined;
  }

  if (precision === "MONTH" && month === null) {
    return undefined;
  }

  return {
    year,
    month: precision === "YEAR" ? null : month,
    day: precision === "DAY" ? day : null,
    precision,
  };
}

function resolveBirthPrecision(precisionValue: number | undefined): BirthDatePrecision {
  if (precisionValue === undefined || precisionValue === null) {
    return "UNKNOWN";
  }

  if (precisionValue >= 11) {
    return "DAY";
  }

  if (precisionValue === 10) {
    return "MONTH";
  }

  if (precisionValue === 9) {
    return "YEAR";
  }

  return "UNKNOWN";
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isWikidataTimeValue(
  value: unknown,
): value is { time: string; precision?: number } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { time?: unknown }).time === "string"
  );
}

function isWikidataTextValue(value: unknown): value is { text: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

function isWikibaseEntityIdValue(value: unknown): value is { id: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { id?: unknown }).id === "string"
  );
}
