import { describe, expect, it } from "vitest";
import { getKoreanSolarDate } from "./korean-lunisolar";

describe("getKoreanSolarDate", () => {
  it("존재하는 윤달 날짜는 양력 날짜로 변환한다", () => {
    expect(getKoreanSolarDate(2023, 2, 1, true)).toEqual({
      year: 2023,
      month: 3,
      day: 22,
    });
  });

  it("존재하지 않는 윤달 날짜는 에러를 던진다", () => {
    expect(() => getKoreanSolarDate(2026, 4, 12, true)).toThrow(RangeError);
  });
});
