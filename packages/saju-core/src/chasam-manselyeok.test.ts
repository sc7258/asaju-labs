import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import {
  buildChasamDateChain,
  resolveClosestBuheojaSolarDate,
  resolveClosestChasamLunarDate,
  selectClosestCharyeokCandidate,
} from "./chasam-manselyeok";

const SEOUL_TIMEZONE = "Asia/Seoul";

function createDateTime(isoText: string) {
  return DateTime.fromISO(isoText, { zone: SEOUL_TIMEZONE });
}

describe("selectClosestCharyeokCandidate", () => {
  it("selects the previous candidate when only it exists", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-01-30T09:00:00"),
        previousCandidateSolarDateTime: createDateTime("1972-01-29T09:00:00"),
        nextCandidateSolarDateTime: null,
      }),
    ).toBe("previous");
  });

  it("selects the next candidate when only it exists", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-01-30T15:00:00"),
        previousCandidateSolarDateTime: null,
        nextCandidateSolarDateTime: createDateTime("1972-02-01T15:00:00"),
      }),
    ).toBe("next");
  });

  it("selects the closer previous candidate", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-01-30T15:00:00"),
        previousCandidateSolarDateTime: createDateTime("1972-01-29T15:00:00"),
        nextCandidateSolarDateTime: createDateTime("1972-02-01T15:00:00"),
      }),
    ).toBe("previous");
  });

  it("selects the closer next candidate", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-01-31T09:00:00"),
        previousCandidateSolarDateTime: createDateTime("1972-01-29T09:00:00"),
        nextCandidateSolarDateTime: createDateTime("1972-02-01T09:00:00"),
      }),
    ).toBe("next");
  });

  it("uses the birth hour as a tie-breaker before noon", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-04-30T09:00:00"),
        previousCandidateSolarDateTime: createDateTime("1972-04-29T09:00:00"),
        nextCandidateSolarDateTime: createDateTime("1972-05-01T09:00:00"),
      }),
    ).toBe("previous");
  });

  it("uses the birth hour as a tie-breaker from noon", () => {
    expect(
      selectClosestCharyeokCandidate({
        baseSolarDateTime: createDateTime("1972-04-30T15:00:00"),
        previousCandidateSolarDateTime: createDateTime("1972-04-29T15:00:00"),
        nextCandidateSolarDateTime: createDateTime("1972-05-01T15:00:00"),
      }),
    ).toBe("next");
  });
});

describe("resolveClosestChasamLunarDate", () => {
  it("keeps the exact solar date when the target lunar date exists", () => {
    const resolved = resolveClosestChasamLunarDate(
      {
        lunarYear: 1972,
        lunarMonth: 1,
        lunarDay: 26,
        isLeapMonth: false,
      },
      createDateTime("1972-01-26T11:30:00"),
    );

    expect(resolved.selection).toBe("exact");
    expect(resolved.resolvedLunar).toEqual({
      lunarYear: 1972,
      lunarMonth: 1,
      lunarDay: 26,
      isLeapMonth: false,
    });
    expect(resolved.resolvedSolar).toEqual({
      year: 1972,
      month: 3,
      day: 11,
    });
  });

  it("falls back to the next valid lunar date when its nominal date is closer", () => {
    const resolved = resolveClosestChasamLunarDate(
      {
        lunarYear: 1972,
        lunarMonth: 1,
        lunarDay: 31,
        isLeapMonth: false,
      },
      createDateTime("1972-01-31T09:00:00"),
    );

    expect(resolved.selection).toBe("next");
    expect(resolved.resolvedLunar).toEqual({
      lunarYear: 1972,
      lunarMonth: 2,
      lunarDay: 1,
      isLeapMonth: false,
    });
    expect(resolved.resolvedSolar).toEqual({
      year: 1972,
      month: 3,
      day: 15,
    });
  });

  it("chooses the next valid lunar date when its nominal date is closer", () => {
    const resolved = resolveClosestChasamLunarDate(
      {
        lunarYear: 1973,
        lunarMonth: 12,
        lunarDay: 31,
        isLeapMonth: false,
      },
      createDateTime("1973-12-31T11:00:00"),
    );

    expect(resolved.selection).toBe("next");
    expect(resolved.resolvedLunar).toEqual({
      lunarYear: 1974,
      lunarMonth: 1,
      lunarDay: 1,
      isLeapMonth: false,
    });
    expect(resolved.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 23,
    });
  });
});

describe("resolveClosestBuheojaSolarDate", () => {
  it("adjusts to the previous solar date before noon", () => {
    const resolved = resolveClosestBuheojaSolarDate(
      {
        year: 1999,
        month: 2,
        day: 29,
      },
      {
        lunarYear: 1999,
        lunarMonth: 2,
        lunarDay: 29,
        isLeapMonth: false,
      },
      createDateTime("1999-04-15T09:00:00"),
    );

    expect(resolved.selection).toBe("previous");
    expect(resolved.resolvedSolar).toEqual({
      year: 1999,
      month: 2,
      day: 28,
    });
  });

  it("adjusts to the next solar date from noon", () => {
    const resolved = resolveClosestBuheojaSolarDate(
      {
        year: 1999,
        month: 2,
        day: 29,
      },
      {
        lunarYear: 1999,
        lunarMonth: 2,
        lunarDay: 29,
        isLeapMonth: false,
      },
      createDateTime("1999-04-15T12:00:00"),
    );

    expect(resolved.selection).toBe("next");
    expect(resolved.resolvedSolar).toEqual({
      year: 1999,
      month: 3,
      day: 1,
    });
  });
});

describe("buildChasamDateChain", () => {
  it("builds the full buheoja, bonwon, and heoja chain", () => {
    const chain = buildChasamDateChain({
      year: 1972,
      month: 1,
      day: 26,
      hour: 11,
      minute: 30,
    });

    expect(chain.buheojaCharyeok.sourceLunar).toEqual({
      lunarYear: 1971,
      lunarMonth: 12,
      lunarDay: 11,
      isLeapMonth: false,
    });
    expect(chain.buheojaCharyeok.resolvedSolar).toEqual({
      year: 1971,
      month: 12,
      day: 11,
    });
    expect(chain.buheojaBonwon.sourceLunar).toEqual({
      lunarYear: 1971,
      lunarMonth: 10,
      lunarDay: 24,
      isLeapMonth: false,
    });
    expect(chain.buheojaBonwon.resolvedSolar).toEqual({
      year: 1971,
      month: 10,
      day: 24,
    });
    expect(chain.bonwon).toEqual({
      year: 1972,
      month: 1,
      day: 26,
    });
    expect(chain.charyeok.targetLunar).toEqual({
      lunarYear: 1972,
      lunarMonth: 1,
      lunarDay: 26,
      isLeapMonth: false,
    });
    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1972,
      month: 3,
      day: 11,
    });
    expect(chain.heojaBonwon.targetLunar).toEqual({
      lunarYear: 1972,
      lunarMonth: 3,
      lunarDay: 11,
      isLeapMonth: false,
    });
    expect(chain.heojaBonwon.resolvedSolar).toEqual({
      year: 1972,
      month: 4,
      day: 24,
    });
    expect(chain.heojaCharyeok.targetLunar).toEqual({
      lunarYear: 1972,
      lunarMonth: 4,
      lunarDay: 24,
      isLeapMonth: false,
    });
  });

  it("keeps building the buheoja chain when the solar fallback is needed", () => {
    const chain = buildChasamDateChain({
      year: 1999,
      month: 5,
      day: 29,
      hour: 12,
      minute: 0,
    });

    expect(chain.buheojaCharyeok.resolvedSolar).toEqual({
      year: 1999,
      month: 4,
      day: 15,
    });
    expect(chain.buheojaBonwon.sourceLunar).toEqual({
      lunarYear: 1999,
      lunarMonth: 2,
      lunarDay: 29,
      isLeapMonth: false,
    });
    expect(chain.buheojaBonwon.resolvedSolar).toEqual({
      year: 1999,
      month: 3,
      day: 1,
    });
  });

  it("keeps 1973-12-29 11:00 on the exact charyeok date", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 29,
      hour: 11,
      minute: 0,
    });

    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 22,
    });
    expect(chain.charyeok.selection).toBe("exact");
  });

  it("keeps 1973-12-29 12:00 on the exact charyeok date", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 29,
      hour: 12,
      minute: 0,
    });

    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 22,
    });
    expect(chain.charyeok.selection).toBe("exact");
  });

  it("maps 1973-12-30 11:00 to the previous valid candidate", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 30,
      hour: 11,
      minute: 0,
    });

    expect(chain.charyeok.resolvedLunar).toEqual({
      lunarYear: 1973,
      lunarMonth: 12,
      lunarDay: 29,
      isLeapMonth: false,
    });
    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 22,
    });
    expect(chain.charyeok.selection).toBe("previous");
  });

  it("maps 1973-12-30 12:00 to the previous valid candidate", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 30,
      hour: 12,
      minute: 0,
    });

    expect(chain.charyeok.resolvedLunar).toEqual({
      lunarYear: 1973,
      lunarMonth: 12,
      lunarDay: 29,
      isLeapMonth: false,
    });
    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 22,
    });
    expect(chain.charyeok.selection).toBe("previous");
  });

  it("maps 1973-12-31 11:00 to the next valid candidate", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 31,
      hour: 11,
      minute: 0,
    });

    expect(chain.charyeok.resolvedLunar).toEqual({
      lunarYear: 1974,
      lunarMonth: 1,
      lunarDay: 1,
      isLeapMonth: false,
    });
    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 23,
    });
    expect(chain.charyeok.selection).toBe("next");
  });

  it("maps 1973-12-31 12:00 to the next valid candidate", () => {
    const chain = buildChasamDateChain({
      year: 1973,
      month: 12,
      day: 31,
      hour: 12,
      minute: 0,
    });

    expect(chain.charyeok.resolvedLunar).toEqual({
      lunarYear: 1974,
      lunarMonth: 1,
      lunarDay: 1,
      isLeapMonth: false,
    });
    expect(chain.charyeok.resolvedSolar).toEqual({
      year: 1974,
      month: 1,
      day: 23,
    });
    expect(chain.charyeok.selection).toBe("next");
  });
});
