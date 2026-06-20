import { DateTime } from "luxon";
import { formatBirthText, parseBirthText } from "./birth-text";
import {
  calculateMajorLuck,
  calculateYearlyLuck,
  getBranchElement,
  getElementLabel,
  getSaju,
  getStemElement,
  type Gender,
  type MajorLuckResult,
} from "@gracefullight/saju";
import { createLuxonAdapter } from "@gracefullight/saju/adapters/luxon";
import { getKoreanLunarDate, getKoreanSolarDate } from "./korean-lunisolar";

const SEOUL_TIMEZONE = "Asia/Seoul";
const DISPLAY_LUCK_COUNT = 10;
const DISPLAY_YEAR_COUNT = 10;

const adapterPromise = createLuxonAdapter();

export type CalendarType = "solar" | "lunar";
type CalendarSelection = CalendarType | "lunar-leap";

export interface ManselyeokInput {
  name: string;
  birthText: string;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth: boolean;
  showDetails: boolean;
  showLuckDividers: boolean;
  useBoardBackground: boolean;
}

export interface DisplayPillar {
  key: "hour" | "day" | "month" | "year";
  title: string;
  stem: string;
  branch: string;
  stemTenGod: string;
  branchTenGod: string;
  stemElement: ReturnType<typeof getStemElement> | null;
  branchElement: ReturnType<typeof getBranchElement> | null;
  stemElementLabel: string;
  branchElementLabel: string;
}

export interface DisplayLuckPillar {
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  pillar: string;
  isCurrent: boolean;
  isSelected: boolean;
}

export interface DisplayYearLuck {
  year: number;
  age: number;
  stem: string;
  branch: string;
  pillar: string;
  isCurrentYear: boolean;
  isSelected: boolean;
}

export type YearlyLuckByMajorStartAge = Record<string, DisplayYearLuck[]>;
type CalculatedYearLuck = ReturnType<typeof calculateYearlyLuck>[number];
type MajorLuckPillar = MajorLuckResult["pillars"][number];

export interface ManselyeokViewModel {
  name: string;
  genderLabel: string;
  showDetails: boolean;
  showLuckDividers: boolean;
  useBoardBackground: boolean;
  profileLabel: string;
  age: number;
  ageLabel: string;
  solarLabel: string;
  solarSummaryLabel: string;
  lunarSummaryLabel: string;
  lunarLabel: string;
  calendarLabel: string;
  pillars: DisplayPillar[];
  majorLuck: DisplayLuckPillar[];
  yearlyLuck: DisplayYearLuck[];
  yearlyLuckByMajorStartAge: YearlyLuckByMajorStartAge;
  currentYear: number;
  currentMajorLuck: DisplayLuckPillar | null;
  selectedMajorLuck: DisplayLuckPillar | null;
  startAgeLabel: string;
  skyNoble: string;
  skyNobleHits: string;
  gongmang: string;
  gongmangHits: string;
}

export interface ManselyeokPageState {
  input: ManselyeokInput;
  errors: string[];
  viewModel: ManselyeokViewModel | null;
}

export const DEFAULT_MANSELYEOK_INPUT: ManselyeokInput = {
  name: "홍길동",
  birthText: "1990 0515 1430",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "male",
  calendarType: "solar",
  isLeapMonth: false,
  showDetails: false,
  showLuckDividers: false,
  useBoardBackground: false,
};

export function createDefaultManselyeokInput(
  now = DateTime.now().setZone(SEOUL_TIMEZONE),
): ManselyeokInput {
  return {
    ...DEFAULT_MANSELYEOK_INPUT,
    birthText: formatBirthText(
      now.year,
      now.month,
      now.day,
      now.hour,
      now.minute,
    ),
    year: now.year,
    month: now.month,
    day: now.day,
    hour: now.hour,
    minute: now.minute,
  };
}

const SKY_NOBLE_MAP: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
  辛: ["午", "寅"],
};

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const POSITION_LABELS = {
  year: "년",
  month: "월",
  day: "일",
  hour: "시",
} as const;

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

function parseOptionalNumber(value: SearchParamValue) {
  const picked = pickFirst(value);

  if (!picked) {
    return null;
  }

  const parsed = Number(picked);

  return Number.isNaN(parsed) ? null : parsed;
}

function pickFirst(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseNumber(value: SearchParamValue, fallback: number) {
  const picked = pickFirst(value);
  const parsed = Number(picked);

  if (!picked || Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

function parseGender(value: SearchParamValue): Gender {
  return pickFirst(value) === "female" ? "female" : "male";
}

function parseCalendarType(value: SearchParamValue): CalendarType {
  return pickFirst(value) === "lunar" ? "lunar" : "solar";
}

function parseCalendarSelection(
  calendarTypeValue: SearchParamValue,
  isLeapMonthValue: SearchParamValue,
): { calendarType: CalendarType; isLeapMonth: boolean } {
  const pickedCalendarSelection = pickFirst(calendarTypeValue) as
    | CalendarSelection
    | undefined;

  if (pickedCalendarSelection === "lunar-leap") {
    return {
      calendarType: "lunar",
      isLeapMonth: true,
    };
  }

  const calendarType = parseCalendarType(calendarTypeValue);

  if (calendarType === "solar") {
    return {
      calendarType,
      isLeapMonth: false,
    };
  }

  return {
    calendarType,
    isLeapMonth: parseBoolean(isLeapMonthValue),
  };
}

function parseBoolean(value: SearchParamValue, fallback = false) {
  const picked = pickFirst(value);

  if (!picked) {
    return fallback;
  }

  return ["true", "1", "on", "yes"].includes(picked);
}

export function parseManselyeokInput(
  searchParams: SearchParams = {},
): ManselyeokInput {
  const defaultInput = createDefaultManselyeokInput();
  const calendarSelection = parseCalendarSelection(
    searchParams.calendarType,
    searchParams.isLeapMonth,
  );
  const birthText = pickFirst(searchParams.birthText)?.trim();
  const parsedBirthText = parseBirthText(birthText);
  const fallbackHour = parseOptionalNumber(searchParams.hour);
  const fallbackMinute = parseOptionalNumber(searchParams.minute);
  const hasFallbackTime = fallbackHour !== null && fallbackMinute !== null;
  const year = parsedBirthText?.year ?? parseNumber(searchParams.year, defaultInput.year);
  const month =
    parsedBirthText?.month ?? parseNumber(searchParams.month, defaultInput.month);
  const day = parsedBirthText?.day ?? parseNumber(searchParams.day, defaultInput.day);
  const hour =
    parsedBirthText?.hour ??
    (birthText
      ? null
      : hasFallbackTime
        ? fallbackHour
        : defaultInput.hour);
  const minute =
    parsedBirthText?.minute ??
    (birthText
      ? null
      : hasFallbackTime
        ? fallbackMinute
        : defaultInput.minute);

  return {
    name: pickFirst(searchParams.name)?.trim() || defaultInput.name,
    birthText:
      birthText && parsedBirthText
        ? formatBirthText(
            parsedBirthText.year,
            parsedBirthText.month,
            parsedBirthText.day,
            parsedBirthText.hour,
            parsedBirthText.minute,
          )
        : birthText || formatBirthText(year, month, day, hour, minute),
    year,
    month,
    day,
    hour,
    minute,
    gender: parseGender(searchParams.gender),
    calendarType: calendarSelection.calendarType,
    isLeapMonth: calendarSelection.isLeapMonth,
    showDetails: parseBoolean(searchParams.showDetails),
    showLuckDividers: parseBoolean(searchParams.showLuckDividers),
    useBoardBackground: parseBoolean(searchParams.useBoardBackground),
  };
}

function hasWholeNumber(value: number | null) {
  if (value === null) {
    return false;
  }

  return Number.isInteger(value);
}

export function validateManselyeokInput(input: ManselyeokInput) {
  const errors: string[] = [];
  const hasBirthTime = input.hour !== null && input.minute !== null;
  const hasPartialBirthTime =
    (input.hour === null && input.minute !== null) ||
    (input.hour !== null && input.minute === null);
  const hourValue = input.hour ?? 0;
  const minuteValue = input.minute ?? 0;

  if (!parseBirthText(input.birthText)) {
    errors.push("생년월일시는 1972 0126 1200 형식으로 입력해 주세요.");
  }

  if (!input.name.trim()) {
    errors.push("이름을 입력해 주세요.");
  }

  if (!hasWholeNumber(input.year)) {
    errors.push("연도는 숫자로 입력해 주세요.");
  }

  if (!hasWholeNumber(input.month) || input.month < 1 || input.month > 12) {
    errors.push("월은 1부터 12 사이로 입력해 주세요.");
  }

  if (!hasWholeNumber(input.day) || input.day < 1 || input.day > 31) {
    errors.push("일은 1부터 31 사이로 입력해 주세요.");
  }

  if (hasPartialBirthTime) {
    errors.push("?쒓컙???낅젰?섎㈃ ?쒕?遺꾨? 紐⑤몢 ?낅젰??二쇱꽭??");
  }

  if (
    hasBirthTime &&
    (!hasWholeNumber(input.hour) || hourValue < 0 || hourValue > 23)
  ) {
    errors.push("시는 0부터 23 사이로 입력해 주세요.");
  }

  if (
    hasBirthTime &&
    (!hasWholeNumber(input.minute) ||
      minuteValue < 0 ||
      minuteValue > 59)
  ) {
    errors.push("분은 0부터 59 사이로 입력해 주세요.");
  }

  if (errors.length > 0) {
    return errors;
  }

  if (input.calendarType === "solar") {
    const date = DateTime.fromObject(
      {
        year: input.year,
        month: input.month,
        day: input.day,
        ...(hasBirthTime
          ? {
              hour: input.hour ?? 0,
              minute: input.minute ?? 0,
            }
          : {}),
      },
      { zone: SEOUL_TIMEZONE },
    );

    if (!date.isValid) {
      errors.push("유효한 양력 날짜와 시간을 입력해 주세요.");
    }

    return errors;
  }

  try {
    getKoreanSolarDate(input.year, input.month, input.day, input.isLeapMonth);
  } catch {
    errors.push("유효한 음력 날짜를 입력해 주세요.");
  }

  return errors;
}

export function resolveSolarBirthDate(input: ManselyeokInput) {
  if (input.calendarType === "solar") {
    return {
      year: input.year,
      month: input.month,
      day: input.day,
    };
  }

  return getKoreanSolarDate(input.year, input.month, input.day, input.isLeapMonth);
}

function getAge(birthDateTime: DateTime, currentDateTime: DateTime) {
  let age = currentDateTime.year - birthDateTime.year;

  const hasBirthdayPassed =
    currentDateTime.month > birthDateTime.month ||
    (currentDateTime.month === birthDateTime.month &&
      currentDateTime.day >= birthDateTime.day);

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function getDefaultSelectedMajorLuckStartAge(
  majorLuck: MajorLuckResult,
  currentAge: number,
) {
  const displayedPillars = [...majorLuck.pillars]
    .slice(0, DISPLAY_LUCK_COUNT)
    .sort((left, right) => right.startAge - left.startAge);

  const currentPillar = displayedPillars.find(
    (pillar) => currentAge >= pillar.startAge && currentAge <= pillar.endAge,
  );

  if (currentPillar) {
    return currentPillar.startAge;
  }

  return displayedPillars[displayedPillars.length - 1]?.startAge ?? null;
}

function buildMajorLuckItems(
  majorLuck: MajorLuckResult,
  currentAge: number,
  selectedMajorLuckStartAge: number | null,
) {
  return [...majorLuck.pillars]
    .slice(0, DISPLAY_LUCK_COUNT)
    .sort((left, right) => right.startAge - left.startAge)
    .map((pillar) => ({
      startAge: pillar.startAge,
      endAge: pillar.endAge,
      stem: pillar.stem,
      branch: pillar.branch,
      pillar: pillar.pillar,
      isCurrent: currentAge >= pillar.startAge && currentAge <= pillar.endAge,
      isSelected: pillar.startAge === selectedMajorLuckStartAge,
    }));
}

function buildYearlyLuckItems(
  birthYear: number,
  currentYear: number,
  selectedMajorLuck: DisplayLuckPillar | null,
  selectedYear?: number | null,
) {
  if (!selectedMajorLuck) {
    return [] as DisplayYearLuck[];
  }

  const startYear = birthYear + selectedMajorLuck.startAge;
  const endYear = birthYear + selectedMajorLuck.endAge;
  const resolvedSelectedYear =
    selectedYear !== null &&
    selectedYear !== undefined &&
    selectedYear >= startYear &&
    selectedYear <= endYear
      ? selectedYear
      : currentYear >= startYear && currentYear <= endYear
        ? currentYear
        : startYear;

  return calculateYearlyLuck(birthYear, startYear, endYear)
    .sort((left: CalculatedYearLuck, right: CalculatedYearLuck) => right.year - left.year)
    .map((yearLuck: CalculatedYearLuck) => ({
      year: yearLuck.year,
      age: yearLuck.age,
      stem: yearLuck.stem,
      branch: yearLuck.branch,
      pillar: yearLuck.pillar,
      isCurrentYear: yearLuck.year === currentYear,
      isSelected: yearLuck.year === resolvedSelectedYear,
    }));
}

function buildYearlyLuckByMajorStartAge(
  birthYear: number,
  currentYear: number,
  majorLuck: DisplayLuckPillar[],
  selectedMajorLuckStartAge: number | null,
  selectedYear?: number | null,
): YearlyLuckByMajorStartAge {
  return Object.fromEntries(
    majorLuck.map((pillar) => [
      String(pillar.startAge),
      buildYearlyLuckItems(
        birthYear,
        currentYear,
        pillar,
        pillar.startAge === selectedMajorLuckStartAge ? selectedYear : null,
      ),
    ]),
  );
}

function formatSolarLabel(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  return `${year}년 ${month}월 ${day}일 ${String(hour).padStart(2, "0")}시 ${String(
    minute,
  ).padStart(2, "0")}분`;
}

function formatSolarSummaryLabel(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean,
) {
  return `${isLeapMonth ? "윤" : "양"} ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLunarSummaryLabel(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean,
) {
  return `${isLeapMonth ? "윤" : "음"} ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLunarLabel(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean,
) {
  return `${year}년 ${isLeapMonth ? "윤" : ""}${month}월 ${day}일`;
}

function getCurrentYear() {
  return DateTime.now().setZone(SEOUL_TIMEZONE).year;
}

function formatPositionHits(positions: string[] | undefined) {
  if (!positions || positions.length === 0) {
    return "-";
  }

  return positions
    .map((position) => POSITION_LABELS[position as keyof typeof POSITION_LABELS])
    .join(",");
}

function createUnknownHourPillar(): DisplayPillar {
  return {
    key: "hour",
    title: "시주",
    stem: "?",
    branch: "?",
    stemTenGod: "?",
    branchTenGod: "?",
    stemElement: null,
    branchElement: null,
    stemElementLabel: "?",
    branchElementLabel: "?",
  };
}

function getGongmangBranches(dayPillar: string) {
  const dayStem = dayPillar[0] ?? "";
  const dayBranch = dayPillar[1] ?? "";
  const stemIndex = STEMS.indexOf(dayStem);
  const branchIndex = BRANCHES.indexOf(dayBranch);

  if (stemIndex === -1 || branchIndex === -1) {
    return [];
  }

  const diff = (branchIndex - stemIndex + 12) % 12;

  return [BRANCHES[(diff + 10) % 12], BRANCHES[(diff + 11) % 12]];
}

export async function createManselyeokViewModel(
  input: ManselyeokInput,
  selectedMajorLuckStartAge?: number | null,
  selectedYear?: number | null,
): Promise<ManselyeokViewModel> {
  const adapter = await adapterPromise;
  const solarDate = resolveSolarBirthDate(input);
  const lunarDate = getKoreanLunarDate(
    solarDate.year,
    solarDate.month,
    solarDate.day,
  );
  const hasBirthTime = input.hour !== null && input.minute !== null;
  const calculationHour = input.hour ?? 12;
  const calculationMinute = input.minute ?? 0;
  const birthDateTime = DateTime.fromObject(
    {
      year: solarDate.year,
      month: solarDate.month,
      day: solarDate.day,
      hour: calculationHour,
      minute: calculationMinute,
    },
    { zone: SEOUL_TIMEZONE },
  );
  const currentAge = getAge(
    birthDateTime,
    DateTime.now().setZone(SEOUL_TIMEZONE),
  );
  const currentYear = getCurrentYear();
  const saju = getSaju(birthDateTime, {
    adapter,
    gender: input.gender,
    yearlyLuckRange: {
      from: currentYear - (DISPLAY_YEAR_COUNT - 1),
      to: currentYear,
    },
  });
  const majorLuckSource = calculateMajorLuck(
    birthDateTime,
    input.gender,
    saju.pillars.year,
    saju.pillars.month,
    {
      adapter,
      count: DISPLAY_LUCK_COUNT,
      nextJieMillis: saju.solarTerms.nextJieMillis,
      prevJieMillis: saju.solarTerms.prevJieMillis,
    },
  );
  const defaultSelectedMajorLuckStartAge = getDefaultSelectedMajorLuckStartAge(
    majorLuckSource,
    currentAge,
  );
  const displayedStartAges = majorLuckSource.pillars
    .slice(0, DISPLAY_LUCK_COUNT)
    .map((pillar: MajorLuckPillar) => pillar.startAge);
  const resolvedSelectedMajorLuckStartAge = displayedStartAges.includes(
    selectedMajorLuckStartAge ?? Number.NaN,
  )
    ? (selectedMajorLuckStartAge ?? null)
    : defaultSelectedMajorLuckStartAge;
  const majorLuck = buildMajorLuckItems(
    majorLuckSource,
    currentAge,
    resolvedSelectedMajorLuckStartAge,
  );
  const currentMajorLuck = majorLuck.find((pillar) => pillar.isCurrent) ?? null;
  const selectedMajorLuck =
    majorLuck.find((pillar) => pillar.isSelected) ?? null;
  const yearlyLuckByMajorStartAge = buildYearlyLuckByMajorStartAge(
    saju.meta.solarYearUsed,
    currentYear,
    majorLuck,
    resolvedSelectedMajorLuckStartAge,
    selectedYear,
  );
  const yearlyLuck = selectedMajorLuck
    ? (yearlyLuckByMajorStartAge[String(selectedMajorLuck.startAge)] ?? [])
    : [];
  const skyNobleBranches = SKY_NOBLE_MAP[saju.pillars.day[0] ?? ""] ?? [];
  const gongmangBranches = getGongmangBranches(saju.pillars.day);

  const viewModel: ManselyeokViewModel = {
    name: input.name.trim(),
    genderLabel: input.gender === "male" ? "남" : "여",
    showDetails: input.showDetails,
    showLuckDividers: input.showLuckDividers,
    useBoardBackground: input.useBoardBackground,
    profileLabel: `${input.gender === "male" ? "남" : "여"} ${input.name.trim()}`,
    age: currentAge,
    ageLabel: `만 ${currentAge}세`,
    solarLabel: formatSolarLabel(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      calculationHour,
      calculationMinute,
    ),
    solarSummaryLabel: formatSolarSummaryLabel(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      input.isLeapMonth,
    ),
    lunarSummaryLabel: formatLunarSummaryLabel(
      lunarDate.lunarYear,
      lunarDate.lunarMonth,
      lunarDate.lunarDay,
      lunarDate.isLeapMonth,
    ),
    lunarLabel: formatLunarLabel(
      lunarDate.lunarYear,
      lunarDate.lunarMonth,
      lunarDate.lunarDay,
      lunarDate.isLeapMonth,
    ),
    calendarLabel:
      input.calendarType === "solar"
        ? "양력 기준 입력"
        : `음력 기준 입력${input.isLeapMonth ? " (윤달)" : ""}`,
    pillars: [
      {
        key: "hour",
        title: "시주",
        stem: saju.pillars.hour[0] ?? "",
        branch: saju.pillars.hour[1] ?? "",
        stemTenGod: saju.tenGods.hour.stem.tenGod.korean,
        branchTenGod: saju.tenGods.hour.branch.tenGod.korean,
        stemElement: getStemElement(saju.pillars.hour[0] ?? ""),
        branchElement: getBranchElement(saju.pillars.hour[1] ?? ""),
        stemElementLabel: getElementLabel(
          getStemElement(saju.pillars.hour[0] ?? ""),
        ).korean,
        branchElementLabel: getElementLabel(
          getBranchElement(saju.pillars.hour[1] ?? ""),
        ).korean,
      },
      {
        key: "day",
        title: "일주",
        stem: saju.pillars.day[0] ?? "",
        branch: saju.pillars.day[1] ?? "",
        stemTenGod: saju.tenGods.day.stem.tenGod.korean,
        branchTenGod: saju.tenGods.day.branch.tenGod.korean,
        stemElement: getStemElement(saju.pillars.day[0] ?? ""),
        branchElement: getBranchElement(saju.pillars.day[1] ?? ""),
        stemElementLabel: getElementLabel(
          getStemElement(saju.pillars.day[0] ?? ""),
        ).korean,
        branchElementLabel: getElementLabel(
          getBranchElement(saju.pillars.day[1] ?? ""),
        ).korean,
      },
      {
        key: "month",
        title: "월주",
        stem: saju.pillars.month[0] ?? "",
        branch: saju.pillars.month[1] ?? "",
        stemTenGod: saju.tenGods.month.stem.tenGod.korean,
        branchTenGod: saju.tenGods.month.branch.tenGod.korean,
        stemElement: getStemElement(saju.pillars.month[0] ?? ""),
        branchElement: getBranchElement(saju.pillars.month[1] ?? ""),
        stemElementLabel: getElementLabel(
          getStemElement(saju.pillars.month[0] ?? ""),
        ).korean,
        branchElementLabel: getElementLabel(
          getBranchElement(saju.pillars.month[1] ?? ""),
        ).korean,
      },
      {
        key: "year",
        title: "년주",
        stem: saju.pillars.year[0] ?? "",
        branch: saju.pillars.year[1] ?? "",
        stemTenGod: saju.tenGods.year.stem.tenGod.korean,
        branchTenGod: saju.tenGods.year.branch.tenGod.korean,
        stemElement: getStemElement(saju.pillars.year[0] ?? ""),
        branchElement: getBranchElement(saju.pillars.year[1] ?? ""),
        stemElementLabel: getElementLabel(
          getStemElement(saju.pillars.year[0] ?? ""),
        ).korean,
        branchElementLabel: getElementLabel(
          getBranchElement(saju.pillars.year[1] ?? ""),
        ).korean,
      },
    ],
    majorLuck,
    yearlyLuck,
    yearlyLuckByMajorStartAge,
    currentYear,
    currentMajorLuck,
    selectedMajorLuck,
    startAgeLabel: `${majorLuckSource.startAge}세 시작 (${majorLuckSource.isForward ? "순행" : "역행"})`,
    skyNoble: skyNobleBranches.join(" "),
    skyNobleHits: formatPositionHits(saju.sinsals.summary.skyNoble),
    gongmang: gongmangBranches.join(" "),
    gongmangHits: formatPositionHits(saju.sinsals.summary.gongmang),
  };

  if (!hasBirthTime) {
    viewModel.pillars[0] = createUnknownHourPillar();
    viewModel.skyNobleHits = formatPositionHits(
      saju.sinsals.summary.skyNoble?.filter((position: string) => position !== "hour"),
    );
    viewModel.gongmangHits = formatPositionHits(
      saju.sinsals.summary.gongmang?.filter((position: string) => position !== "hour"),
    );
  }

  return viewModel;
}

export async function getManselyeokPageState(
  searchParams: SearchParams = {},
): Promise<ManselyeokPageState> {
  const input = parseManselyeokInput(searchParams);
  const selectedMajorLuckStartAge = parseOptionalNumber(
    searchParams.selectedMajorLuckStartAge,
  );
  const selectedYear = parseOptionalNumber(searchParams.selectedYear);
  const errors = validateManselyeokInput(input);

  if (errors.length > 0) {
    return {
      input,
      errors,
      viewModel: null,
    };
  }

  try {
    const viewModel = await createManselyeokViewModel(
      input,
      selectedMajorLuckStartAge,
      selectedYear,
    );

    return {
      input,
      errors: [],
      viewModel,
    };
  } catch {
    return {
      input,
      errors: [
        "만세력 계산 중 문제가 발생했습니다. 입력값을 다시 확인해 주세요.",
      ],
      viewModel: null,
    };
  }
}

export function getElementThemeKey(
  element: ReturnType<typeof getStemElement>,
) {
  return element;
}
