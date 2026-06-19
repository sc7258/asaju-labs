import { formatBirthText } from "./birth-text";
import {
  buildChasamDateChain,
  type CalendarDate,
} from "./chasam-manselyeok";
import {
  createManselyeokViewModel,
  parseManselyeokInput,
  resolveSolarBirthDate,
  validateManselyeokInput,
  type ManselyeokInput,
  type ManselyeokViewModel,
} from "./manselyeok";

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

export type ChasamPanelKey =
  | "buheoja-bonwon"
  | "buheoja-charyeok"
  | "bonwon"
  | "charyeok"
  | "heoja-bonwon"
  | "heoja-charyeok";

export interface ChasamPanelState {
  key: ChasamPanelKey;
  isBoncha: boolean;
  input: ManselyeokInput;
  viewModel: ManselyeokViewModel;
}

export interface ChasamManselyeokPageState {
  input: ManselyeokInput;
  errors: string[];
  panels: ChasamPanelState[] | null;
}

function createDerivedSolarInput(
  baseInput: ManselyeokInput,
  solarDate: CalendarDate,
): ManselyeokInput {
  return {
    ...baseInput,
    birthText: formatBirthText(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      baseInput.hour,
      baseInput.minute,
    ),
    year: solarDate.year,
    month: solarDate.month,
    day: solarDate.day,
    calendarType: "solar",
    isLeapMonth: false,
  };
}

function getChasamSourceDate(input: ManselyeokInput): CalendarDate {
  if (input.calendarType === "lunar") {
    return resolveSolarBirthDate(input);
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
  };
}

export async function getChasamManselyeokPageState(
  searchParams: SearchParams = {},
): Promise<ChasamManselyeokPageState> {
  const input = parseManselyeokInput(searchParams);
  const errors = validateManselyeokInput(input);

  if (errors.length > 0) {
    return {
      input,
      errors,
      panels: null,
    };
  }

  const chasamSourceDate = getChasamSourceDate(input);
  const chain = buildChasamDateChain({
    ...chasamSourceDate,
    hour: input.hour ?? 12,
    minute: input.minute ?? 0,
  });

  const panelSpecs: Array<{
    key: ChasamPanelKey;
    solarDate: CalendarDate;
  }> = [
    { key: "buheoja-bonwon", solarDate: chain.buheojaBonwon.resolvedSolar },
    { key: "buheoja-charyeok", solarDate: chain.buheojaCharyeok.resolvedSolar },
    { key: "bonwon", solarDate: chasamSourceDate },
    { key: "charyeok", solarDate: chain.charyeok.resolvedSolar },
    { key: "heoja-bonwon", solarDate: chain.heojaBonwon.resolvedSolar },
    { key: "heoja-charyeok", solarDate: chain.heojaCharyeok.resolvedSolar },
  ];

  try {
    const panels = await Promise.all(
      panelSpecs.map(async ({ key, solarDate }) => {
        const derivedInput = createDerivedSolarInput(input, solarDate);

        return {
          key,
          isBoncha: key === "bonwon" || key === "charyeok",
          input: derivedInput,
          viewModel: await createManselyeokViewModel(derivedInput),
        } satisfies ChasamPanelState;
      }),
    );

    return {
      input,
      errors: [],
      panels,
    };
  } catch {
    return {
      input,
      errors: ["차샘만세력 계산 중 문제가 발생했습니다. 입력값을 다시 확인해 주세요."],
      panels: null,
    };
  }
}
