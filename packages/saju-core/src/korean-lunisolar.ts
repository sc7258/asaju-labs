import type { LunarDate } from "@gracefullight/saju";
import KoreanLunarCalendar from "korean-lunar-calendar";

export interface SolarCalendarDate {
  year: number;
  month: number;
  day: number;
}

function createCalendar() {
  return new KoreanLunarCalendar();
}

function createInvalidLunarDateError() {
  return new RangeError("한국 음력 날짜 범위를 벗어났거나 유효하지 않습니다.");
}

export function getKoreanSolarDate(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): SolarCalendarDate {
  const calendar = createCalendar();

  if (!calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth)) {
    throw createInvalidLunarDateError();
  }

  const lunar = calendar.getLunarCalendar();

  if (
    lunar.year !== lunarYear ||
    lunar.month !== lunarMonth ||
    lunar.day !== lunarDay ||
    (lunar.intercalation ?? false) !== isLeapMonth
  ) {
    throw createInvalidLunarDateError();
  }

  const solar = calendar.getSolarCalendar();

  return {
    year: solar.year,
    month: solar.month,
    day: solar.day,
  };
}

export function getKoreanLunarDate(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
): LunarDate {
  const calendar = createCalendar();

  if (!calendar.setSolarDate(solarYear, solarMonth, solarDay)) {
    throw new RangeError("한국 양력 날짜 범위를 벗어났거나 유효하지 않습니다.");
  }

  const lunar = calendar.getLunarCalendar();

  return {
    lunarYear: lunar.year,
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    isLeapMonth: lunar.intercalation ?? false,
  };
}
