import { getChasamManselyeokPageState } from "@repo/saju-core";

export interface SajuPlateSnapshot {
  plateType: string;
  sajuYearStem: string;
  sajuYearBranch: string;
  sajuMonthStem: string;
  sajuMonthBranch: string;
  sajuDayStem: string;
  sajuDayBranch: string;
}

export async function calculateSajuPlatesForSolarDate(input: {
  year: number;
  month: number;
  day: number;
}): Promise<SajuPlateSnapshot[]> {
  const pageState = await getChasamManselyeokPageState({
    y: String(input.year),
    m: String(input.month),
    d: String(input.day),
    h: "12",
    min: "0",
    g: "m",
    t: "solar",
    bt: "Unknown",
  });

  if (!pageState.panels) {
    throw new Error("Failed to calculate Saju plates: " + pageState.errors.join(", "));
  }

  const mapKeyToEnum = (key: string): string => {
    switch (key) {
      case "buheoja-bonwon": return "BUHEOJA_BONWON";
      case "buheoja-charyeok": return "BUHEOJA_CHARYEOK";
      case "bonwon": return "BONWON";
      case "charyeok": return "CHARYEOK";
      case "heoja-bonwon": return "HEOJA_BONWON";
      case "heoja-charyeok": return "HEOJA_CHARYEOK";
      default: return "BONWON";
    }
  };

  return pageState.panels.map(panel => {
    const yearPillar = panel.viewModel.pillars.find(p => p.key === "year");
    const monthPillar = panel.viewModel.pillars.find(p => p.key === "month");
    const dayPillar = panel.viewModel.pillars.find(p => p.key === "day");

    return {
      plateType: mapKeyToEnum(panel.key),
      sajuYearStem: yearPillar?.stem ?? "",
      sajuYearBranch: yearPillar?.branch ?? "",
      sajuMonthStem: monthPillar?.stem ?? "",
      sajuMonthBranch: monthPillar?.branch ?? "",
      sajuDayStem: dayPillar?.stem ?? "",
      sajuDayBranch: dayPillar?.branch ?? "",
    };
  });
}
