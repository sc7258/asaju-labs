import { DateTime } from "luxon";

export interface SajuPillarSnapshot {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
}

const SEOUL_TIMEZONE = "Asia/Seoul";
const dynamicImport = new Function(
  "specifier",
  "return import(specifier);",
) as (specifier: string) => Promise<any>;

export async function calculateSajuPillarsForSolarDate(input: {
  year: number;
  month: number;
  day: number;
}): Promise<SajuPillarSnapshot> {
  const [{ getSaju }, { createLuxonAdapter }] = await Promise.all([
    dynamicImport("@gracefullight/saju"),
    dynamicImport("@gracefullight/saju/adapters/luxon"),
  ]);
  const adapter = await createLuxonAdapter();
  const birthDateTime = DateTime.fromObject(
    {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: 12,
      minute: 0,
    },
    { zone: SEOUL_TIMEZONE },
  );
  const saju = getSaju(birthDateTime, {
    adapter,
    gender: "male",
    yearlyLuckRange: {
      from: input.year,
      to: input.year,
    },
  });

  return {
    yearStem: saju.pillars.year[0] ?? "",
    yearBranch: saju.pillars.year[1] ?? "",
    monthStem: saju.pillars.month[0] ?? "",
    monthBranch: saju.pillars.month[1] ?? "",
    dayStem: saju.pillars.day[0] ?? "",
    dayBranch: saju.pillars.day[1] ?? "",
  };
}
