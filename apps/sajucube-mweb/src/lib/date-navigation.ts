import { DateTime } from "luxon";
import { compactBirthText, parseBirthText } from "@repo/saju-core";
import { getKoreanLunarDate, getKoreanSolarDate } from "@repo/saju-core";

const SEOUL_TIMEZONE = "Asia/Seoul";

export type CalendarSelection = "solar" | "lunar" | "lunar-leap";

interface ShiftBirthTextByDaysInput {
  birthText: string;
  calendarSelection: CalendarSelection;
  dayDelta: number;
}

interface ShiftBirthTextByDaysResult {
  birthText: string;
  calendarSelection: CalendarSelection;
}

function formatBirthTextDigits(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  minute: number | null,
  digitLength: number,
) {
  const dateText = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;

  if (digitLength <= 8 || hour === null) {
    return dateText;
  }

  const hourText = String(hour).padStart(2, "0");

  if (digitLength <= 10) {
    return `${dateText}${hourText}`;
  }

  return `${dateText}${hourText}${String(minute ?? 0).padStart(2, "0")}`;
}

export function shiftBirthTextByDays({
  birthText,
  calendarSelection,
  dayDelta,
}: ShiftBirthTextByDaysInput): ShiftBirthTextByDaysResult | null {
  const compactBirth = compactBirthText(birthText);
  const parsedBirthText = parseBirthText(compactBirth);

  if (!parsedBirthText) {
    return null;
  }

  const baseHour = parsedBirthText.hour ?? 12;
  const baseMinute = parsedBirthText.minute ?? 0;

  if (calendarSelection === "solar") {
    const shiftedSolarDateTime = DateTime.fromObject(
      {
        year: parsedBirthText.year,
        month: parsedBirthText.month,
        day: parsedBirthText.day,
        hour: baseHour,
        minute: baseMinute,
      },
      { zone: SEOUL_TIMEZONE },
    ).plus({ days: dayDelta });

    if (!shiftedSolarDateTime.isValid) {
      return null;
    }

    return {
      birthText: formatBirthTextDigits(
        shiftedSolarDateTime.year,
        shiftedSolarDateTime.month,
        shiftedSolarDateTime.day,
        parsedBirthText.hour,
        parsedBirthText.minute,
        compactBirth.length,
      ),
      calendarSelection: "solar",
    };
  }

  try {
    const solarDate = getKoreanSolarDate(
      parsedBirthText.year,
      parsedBirthText.month,
      parsedBirthText.day,
      calendarSelection === "lunar-leap",
    );
    const shiftedSolarDateTime = DateTime.fromObject(
      {
        year: solarDate.year,
        month: solarDate.month,
        day: solarDate.day,
        hour: baseHour,
        minute: baseMinute,
      },
      { zone: SEOUL_TIMEZONE },
    ).plus({ days: dayDelta });

    if (!shiftedSolarDateTime.isValid) {
      return null;
    }

    const shiftedLunarDate = getKoreanLunarDate(
      shiftedSolarDateTime.year,
      shiftedSolarDateTime.month,
      shiftedSolarDateTime.day,
    );

    return {
      birthText: formatBirthTextDigits(
        shiftedLunarDate.lunarYear,
        shiftedLunarDate.lunarMonth,
        shiftedLunarDate.lunarDay,
        parsedBirthText.hour,
        parsedBirthText.minute,
        compactBirth.length,
      ),
      calendarSelection: shiftedLunarDate.isLeapMonth ? "lunar-leap" : "lunar",
    };
  } catch {
    return null;
  }
}
