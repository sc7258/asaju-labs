import { DateTime } from "luxon";
import type { LunarDate } from "@gracefullight/saju";
import {
  getKoreanLunarDate,
  getKoreanSolarDate,
} from "./korean-lunisolar";

const SEOUL_TIMEZONE = "Asia/Seoul";
const SEARCH_START_MONTH = 1;
const SEARCH_START_DAY = 1;
const SEARCH_END_MONTH = 12;
const SEARCH_END_DAY = 31;

export interface CharyeokCandidateSelectionInput {
  baseSolarDateTime: DateTime;
  previousCandidateSolarDateTime: DateTime | null;
  nextCandidateSolarDateTime: DateTime | null;
}

export type CharyeokCandidateDirection = "previous" | "next" | null;

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface CalendarDateTime extends CalendarDate {
  hour: number;
  minute: number;
}

interface LunarCalendarEntry {
  lunar: LunarDate;
  solar: CalendarDate;
}

interface BuheojaSolarResolution {
  resolvedSolar: CalendarDate;
  selection: "exact" | "previous" | "next";
}

export interface ResolvedChasamLunarDate {
  targetLunar: LunarDate;
  resolvedLunar: LunarDate;
  resolvedSolar: CalendarDate;
  selection: "exact" | "previous" | "next";
}

export interface ChasamDateStage {
  sourceSolar: CalendarDate;
  targetLunar: LunarDate;
  resolvedLunar: LunarDate;
  resolvedSolar: CalendarDate;
  selection: "exact" | "previous" | "next";
}

export interface BuheojaDateStage {
  sourceSolar: CalendarDate;
  sourceLunar: LunarDate;
  resolvedSolar: CalendarDate;
}

export interface ChasamDateChain {
  buheojaBonwon: BuheojaDateStage;
  buheojaCharyeok: BuheojaDateStage;
  bonwon: CalendarDate;
  charyeok: ChasamDateStage;
  heojaBonwon: ChasamDateStage;
  heojaCharyeok: ChasamDateStage;
}

function toSeoulDateTime(value: DateTime) {
  return value.setZone(SEOUL_TIMEZONE, { keepLocalTime: false });
}

function createDateTime({
  year,
  month,
  day,
  hour,
  minute,
}: CalendarDateTime) {
  return DateTime.fromObject(
    {
      year,
      month,
      day,
      hour,
      minute,
    },
    { zone: SEOUL_TIMEZONE },
  );
}

function createDateTimeFromDate(
  date: CalendarDate,
  hour: number,
  minute: number,
) {
  return createDateTime({
    ...date,
    hour,
    minute,
  });
}

function createCalendarDate(value: DateTime): CalendarDate {
  return {
    year: value.year,
    month: value.month,
    day: value.day,
  };
}

function compareLunarDates(left: LunarDate, right: LunarDate) {
  if (left.lunarYear !== right.lunarYear) {
    return left.lunarYear - right.lunarYear;
  }

  if (left.lunarMonth !== right.lunarMonth) {
    return left.lunarMonth - right.lunarMonth;
  }

  if (left.isLeapMonth !== right.isLeapMonth) {
    return left.isLeapMonth ? 1 : -1;
  }

  return left.lunarDay - right.lunarDay;
}

function isValidSolarDate(targetSolar: CalendarDate) {
  return DateTime.fromObject(targetSolar, { zone: SEOUL_TIMEZONE }).isValid;
}

function getOverflowedSolarDate(targetSolar: CalendarDate) {
  return DateTime.fromObject(
    {
      year: targetSolar.year,
      month: targetSolar.month,
      day: 1,
    },
    { zone: SEOUL_TIMEZONE },
  ).plus({ days: targetSolar.day - 1 });
}

function buildBuheojaFallbackCandidates(targetSolar: CalendarDate) {
  const overflowed = getOverflowedSolarDate(targetSolar);

  return [
    overflowed.minus({ days: 1 }),
    overflowed.minus({ days: 2 }),
    overflowed,
    overflowed.plus({ days: 1 }),
  ].map(createCalendarDate);
}

export function resolveClosestBuheojaSolarDate(
  targetSolar: CalendarDate,
  targetLunar: LunarDate,
  baseSolarDateTime: DateTime,
): BuheojaSolarResolution {
  if (isValidSolarDate(targetSolar)) {
    return {
      resolvedSolar: targetSolar,
      selection: "exact",
    };
  }

  const matchingCandidate = buildBuheojaFallbackCandidates(targetSolar).find(
    (candidate) =>
      compareLunarDates(
        getKoreanLunarDate(candidate.year, candidate.month, candidate.day),
        targetLunar,
      ) === 0,
  );

  if (matchingCandidate) {
    const overflowed = getOverflowedSolarDate(targetSolar);
    const matchingCandidateDateTime = createDateTimeFromDate(
      matchingCandidate,
      baseSolarDateTime.hour,
      baseSolarDateTime.minute,
    );

    return {
      resolvedSolar: matchingCandidate,
      selection:
        matchingCandidateDateTime.toMillis() < overflowed.toMillis()
          ? "previous"
          : "next",
    };
  }

  const overflowed = getOverflowedSolarDate(targetSolar);

  if (baseSolarDateTime.hour < 12) {
    return {
      resolvedSolar: createCalendarDate(overflowed.minus({ days: 1 })),
      selection: "previous",
    };
  }

  return {
    resolvedSolar: createCalendarDate(overflowed),
    selection: "next",
  };
}

function buildLunarCalendarEntries(targetLunarYear: number) {
  const entries: LunarCalendarEntry[] = [];
  let current = DateTime.fromObject(
    {
      year: targetLunarYear,
      month: SEARCH_START_MONTH,
      day: SEARCH_START_DAY,
    },
    { zone: SEOUL_TIMEZONE },
  );
  const end = DateTime.fromObject(
    {
      year: targetLunarYear + 1,
      month: SEARCH_END_MONTH,
      day: SEARCH_END_DAY,
    },
    { zone: SEOUL_TIMEZONE },
  );

  while (current <= end) {
    const solar = {
      year: current.year,
      month: current.month,
      day: current.day,
    };
    const lunar = getKoreanLunarDate(solar.year, solar.month, solar.day);

    entries.push({
      solar,
      lunar,
    });

    current = current.plus({ days: 1 });
  }

  return entries.filter(
    (entry) =>
      entry.lunar.lunarYear === targetLunarYear ||
      entry.lunar.lunarYear === targetLunarYear + 1,
  );
}

function resolveExistingSolarDate(targetLunar: LunarDate) {
  const solar = getKoreanSolarDate(
    targetLunar.lunarYear,
    targetLunar.lunarMonth,
    targetLunar.lunarDay,
    targetLunar.isLeapMonth,
  );

  return {
    targetLunar,
    resolvedLunar: targetLunar,
    resolvedSolar: solar,
    selection: "exact" as const,
  };
}

export function selectClosestCharyeokCandidate({
  baseSolarDateTime,
  previousCandidateSolarDateTime,
  nextCandidateSolarDateTime,
}: CharyeokCandidateSelectionInput): CharyeokCandidateDirection {
  if (!previousCandidateSolarDateTime && !nextCandidateSolarDateTime) {
    return null;
  }

  if (!previousCandidateSolarDateTime) {
    return "next";
  }

  if (!nextCandidateSolarDateTime) {
    return "previous";
  }

  const base = toSeoulDateTime(baseSolarDateTime);
  const previous = toSeoulDateTime(previousCandidateSolarDateTime);
  const next = toSeoulDateTime(nextCandidateSolarDateTime);
  const previousDistance = Math.abs(previous.toMillis() - base.toMillis());
  const nextDistance = Math.abs(next.toMillis() - base.toMillis());

  if (previousDistance < nextDistance) {
    return "previous";
  }

  if (nextDistance < previousDistance) {
    return "next";
  }

  return base.hour < 12 ? "previous" : "next";
}

export function resolveClosestChasamLunarDate(
  targetLunar: LunarDate,
  baseSolarDateTime: DateTime,
): ResolvedChasamLunarDate {
  try {
    return resolveExistingSolarDate(targetLunar);
  } catch {
    const entries = buildLunarCalendarEntries(targetLunar.lunarYear);
    const previousEntry =
      [...entries]
        .reverse()
        .find((entry) => compareLunarDates(entry.lunar, targetLunar) < 0) ?? null;
    const nextEntry =
      entries.find((entry) => compareLunarDates(entry.lunar, targetLunar) > 0) ??
      null;
    const selection = selectClosestCharyeokCandidate({
      baseSolarDateTime,
      previousCandidateSolarDateTime: previousEntry
        ? createDateTimeFromDate(
            {
              year: previousEntry.lunar.lunarYear,
              month: previousEntry.lunar.lunarMonth,
              day: previousEntry.lunar.lunarDay,
            },
            baseSolarDateTime.hour,
            baseSolarDateTime.minute,
          )
        : null,
      nextCandidateSolarDateTime: nextEntry
        ? createDateTimeFromDate(
            {
              year: nextEntry.lunar.lunarYear,
              month: nextEntry.lunar.lunarMonth,
              day: nextEntry.lunar.lunarDay,
            },
            baseSolarDateTime.hour,
            baseSolarDateTime.minute,
          )
        : null,
    });

    if (selection === "previous" && previousEntry) {
      return {
        targetLunar,
        resolvedLunar: previousEntry.lunar,
        resolvedSolar: previousEntry.solar,
        selection,
      };
    }

    if (selection === "next" && nextEntry) {
      return {
        targetLunar,
        resolvedLunar: nextEntry.lunar,
        resolvedSolar: nextEntry.solar,
        selection,
      };
    }

    throw new Error("차샘만세력 날짜 후보를 결정할 수 없습니다.");
  }
}

export function buildCharyeokStage(source: CalendarDateTime): ChasamDateStage {
  const targetLunar: LunarDate = {
    lunarYear: source.year,
    lunarMonth: source.month,
    lunarDay: source.day,
    isLeapMonth: false,
  };
  const resolved = resolveClosestChasamLunarDate(
    targetLunar,
    createDateTime(source),
  );

  return {
    sourceSolar: {
      year: source.year,
      month: source.month,
      day: source.day,
    },
    ...resolved,
  };
}

export function buildBuheojaStage(source: CalendarDateTime): BuheojaDateStage {
  const sourceLunar = getKoreanLunarDate(source.year, source.month, source.day);
  const targetSolar = {
    year: sourceLunar.lunarYear,
    month: sourceLunar.lunarMonth,
    day: sourceLunar.lunarDay,
  };
  const resolved = resolveClosestBuheojaSolarDate(
    targetSolar,
    sourceLunar,
    createDateTime(source),
  );

  return {
    sourceSolar: {
      year: source.year,
      month: source.month,
      day: source.day,
    },
    sourceLunar,
    resolvedSolar: resolved.resolvedSolar,
  };
}

export function buildChasamDateChain(source: CalendarDateTime): ChasamDateChain {
  const buheojaCharyeok = buildBuheojaStage(source);
  const buheojaBonwon = buildBuheojaStage({
    ...buheojaCharyeok.resolvedSolar,
    hour: source.hour,
    minute: source.minute,
  });
  const charyeok = buildCharyeokStage(source);
  const heojaBonwon = buildCharyeokStage({
    ...charyeok.resolvedSolar,
    hour: source.hour,
    minute: source.minute,
  });
  const heojaCharyeok = buildCharyeokStage({
    ...heojaBonwon.resolvedSolar,
    hour: source.hour,
    minute: source.minute,
  });

  return {
    buheojaBonwon,
    buheojaCharyeok,
    bonwon: {
      year: source.year,
      month: source.month,
      day: source.day,
    },
    charyeok,
    heojaBonwon,
    heojaCharyeok,
  };
}
