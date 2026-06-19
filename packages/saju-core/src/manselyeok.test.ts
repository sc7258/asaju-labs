import { DateTime, Settings } from "luxon";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_MANSELYEOK_INPUT,
  createDefaultManselyeokInput,
  createManselyeokViewModel,
  parseManselyeokInput,
  resolveSolarBirthDate,
  validateManselyeokInput,
} from "./manselyeok";

afterEach(() => {
  Settings.now = () => Date.now();
});

describe("parseManselyeokInput", () => {
  it("파라미터가 없으면 서울 현재 시각을 기본값으로 사용한다", () => {
    const fixedNow = DateTime.fromISO("2026-04-06T21:17:00", {
      zone: "Asia/Seoul",
    });
    Settings.now = () => fixedNow.toMillis();

    expect(parseManselyeokInput()).toEqual(createDefaultManselyeokInput(fixedNow));
  });

  it("공백 없는 생년월일시를 정규화해서 파싱한다", () => {
    expect(
      parseManselyeokInput({
        birthText: "198004160700",
        gender: "female",
        calendarType: "lunar",
        isLeapMonth: "on",
      }),
    ).toEqual({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1980 0416 0700",
      year: 1980,
      month: 4,
      day: 16,
      hour: 7,
      minute: 0,
      gender: "female",
      calendarType: "lunar",
      isLeapMonth: true,
    });
  });

  it("시간 없이 입력한 생년월일을 날짜까지만 정규화한다", () => {
    expect(
      parseManselyeokInput({
        birthText: "19800416",
      }),
    ).toEqual({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1980 0416",
      year: 1980,
      month: 4,
      day: 16,
      hour: null,
      minute: null,
    });
  });

  it("시간까지만 입력하면 분은 00으로 보정해서 파싱한다", () => {
    expect(
      parseManselyeokInput({
        birthText: "1999052911",
      }),
    ).toEqual({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1999 0529 1100",
      year: 1999,
      month: 5,
      day: 29,
      hour: 11,
      minute: 0,
    });
  });

  it("윤달 선택값을 음력 윤달 입력으로 파싱한다", () => {
    expect(
      parseManselyeokInput({
        birthText: "1980 0416 0700",
        calendarType: "lunar-leap",
      }),
    ).toEqual({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1980 0416 0700",
      year: 1980,
      month: 4,
      day: 16,
      hour: 7,
      minute: 0,
      calendarType: "lunar",
      isLeapMonth: true,
    });
  });

  it("표시 옵션 설정을 파싱한다", () => {
    const input = parseManselyeokInput({
      showDetails: "true",
      showLuckDividers: "true",
      useBoardBackground: "true",
    });

    expect(input.showDetails).toBe(true);
    expect(input.showLuckDividers).toBe(true);
    expect(input.useBoardBackground).toBe(true);
  });
  it("shows a compact solar summary for the profile header", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      name: "이름없음",
      gender: "male",
      birthText: "1990 0515 1430",
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      calendarType: "solar",
    });

    expect(viewModel.profileLabel).toBe("남 이름없음");
    expect(viewModel.solarSummaryLabel).toBe("양 1990-05-15");
    expect(viewModel.lunarSummaryLabel).toBe("음 1990-04-21");
  });

  it("shows the converted solar date in the profile header for lunar input", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      name: "이름없음",
      gender: "male",
      birthText: "1999 1125",
      year: 1999,
      month: 11,
      day: 25,
      hour: null,
      minute: null,
      calendarType: "lunar",
      isLeapMonth: false,
    });

    expect(viewModel.profileLabel).toBe("남 이름없음");
    expect(viewModel.solarSummaryLabel).toBe("양 2000-01-01");
    expect(viewModel.lunarSummaryLabel).toBe("음 1999-11-25");
  });

  it("uses korean-lunar-calendar for historical solar input labels", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      name: "이름없음",
      gender: "male",
      birthText: "1397 0515",
      year: 1397,
      month: 5,
      day: 15,
      hour: null,
      minute: null,
      calendarType: "solar",
    });

    expect(viewModel.solarSummaryLabel).toBe("양 1397-05-15");
    expect(viewModel.lunarSummaryLabel).toBe("음 1397-04-10");
    expect(viewModel.lunarLabel).toBe("1397년 4월 10일");
  });

  it("uses 윤 prefix in the solar summary when the input is a leap month", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      name: "이름없음",
      gender: "female",
      birthText: "2023 0201",
      year: 2023,
      month: 2,
      day: 1,
      hour: null,
      minute: null,
      calendarType: "lunar",
      isLeapMonth: true,
    });

    expect(viewModel.solarSummaryLabel.startsWith("윤 ")).toBe(true);
  });
});

describe("validateManselyeokInput", () => {
  it("잘못된 생년월일시 형식을 검증한다", () => {
    const errors = validateManselyeokInput({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "198004",
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("1643년도 입력을 허용한다", () => {
    const errors = validateManselyeokInput({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1643 0515 1430",
      year: 1643,
    });

    expect(errors.some((error) => error.includes("1900"))).toBe(false);
  });
});

describe("resolveSolarBirthDate", () => {
  it("음력 날짜를 양력 날짜로 변환한다", () => {
    expect(
      resolveSolarBirthDate({
        ...DEFAULT_MANSELYEOK_INPUT,
        calendarType: "lunar",
        year: 1999,
        month: 11,
        day: 25,
        isLeapMonth: false,
      }),
    ).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
  });

  it("한국 기준 음력 날짜를 양력 날짜로 변환한다", () => {
    expect(
      resolveSolarBirthDate({
        ...DEFAULT_MANSELYEOK_INPUT,
        calendarType: "lunar",
        year: 1976,
        month: 10,
        day: 28,
        hour: 7,
        minute: 0,
        isLeapMonth: false,
      }),
    ).toEqual({
      year: 1976,
      month: 12,
      day: 19,
    });
  });
});

describe("createManselyeokViewModel", () => {
  it("대운을 10개까지 만든다", async () => {
    const viewModel = await createManselyeokViewModel(DEFAULT_MANSELYEOK_INPUT);

    expect(viewModel.majorLuck).toHaveLength(10);
    expect(viewModel.yearlyLuck).toHaveLength(10);
  });

  it("범위를 벗어나면 출생 기준 첫 대운과 첫 세운을 선택한다", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1643 0104 1430",
      year: 1643,
      month: 1,
      day: 4,
      hour: 14,
      minute: 30,
    });

    expect(viewModel.majorLuck[9]?.startAge).toBe(0);
    expect(viewModel.majorLuck[9]?.isSelected).toBe(true);
    expect(viewModel.yearlyLuck[0]?.year).toBe(1651);
    expect(viewModel.yearlyLuck[9]?.year).toBe(1642);
    expect(viewModel.yearlyLuck[9]?.isSelected).toBe(true);
  });

  it("선택한 대운 범위의 세운만 보여주고 올해가 포함되면 올해를 선택한다", async () => {
    const viewModel = await createManselyeokViewModel(
      DEFAULT_MANSELYEOK_INPUT,
      27,
    );

    expect(viewModel.selectedMajorLuck?.startAge).toBe(27);
    expect(viewModel.yearlyLuck[0]?.year).toBe(2026);
    expect(viewModel.yearlyLuck[9]?.year).toBe(2017);
    expect(
      viewModel.yearlyLuck.some((item) => item.year === 2026 && item.isSelected),
    ).toBe(true);
    expect(viewModel.yearlyLuckByMajorStartAge["27"]).toEqual(viewModel.yearlyLuck);
  });

  it("선택한 대운 범위에 올해가 없으면 첫 번째 세운을 선택한다", async () => {
    const viewModel = await createManselyeokViewModel(
      DEFAULT_MANSELYEOK_INPUT,
      17,
    );

    expect(viewModel.selectedMajorLuck?.startAge).toBe(17);
    expect(viewModel.yearlyLuck[0]?.year).toBe(2016);
    expect(viewModel.yearlyLuck[9]?.year).toBe(2007);
    expect(viewModel.yearlyLuck[9]?.isSelected).toBe(true);
  });

  it("입춘 전 출생자는 세운 계산에 절입 기준 연도를 사용한다", async () => {
    const input = {
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "2000 0101 1800",
      year: 2000,
      month: 1,
      day: 1,
      hour: 18,
      minute: 0,
    };
    const initialViewModel = await createManselyeokViewModel(input);
    const selectedMajorLuckStartAge =
      initialViewModel.majorLuck[initialViewModel.majorLuck.length - 1]?.startAge;

    expect(selectedMajorLuckStartAge).toBeDefined();

    const viewModel = await createManselyeokViewModel(
      input,
      selectedMajorLuckStartAge,
    );

    expect(viewModel.yearlyLuck[9]?.year).toBe(
      (selectedMajorLuckStartAge ?? 0) + 1999,
    );
    expect(viewModel.yearlyLuck[0]?.year).toBe(
      (selectedMajorLuckStartAge ?? 0) + 2008,
    );
  });

  it("세운을 선택하면 해당 세운으로 선택 상태가 변경된다", async () => {
    const viewModel = await createManselyeokViewModel(
      DEFAULT_MANSELYEOK_INPUT,
      27,
      2024,
    );

    expect(viewModel.selectedMajorLuck?.startAge).toBe(27);
    expect(
      viewModel.yearlyLuck.some((item) => item.year === 2024 && item.isSelected),
    ).toBe(true);
    expect(
      viewModel.yearlyLuck.some((item) => item.year === 2026 && item.isSelected),
    ).toBe(false);
  });

  it("시간 모름이면 시주를 물음표로 표시한다", async () => {
    const viewModel = await createManselyeokViewModel({
      ...DEFAULT_MANSELYEOK_INPUT,
      birthText: "1990 0515",
      hour: null,
      minute: null,
    });

    expect(viewModel.pillars[0]).toMatchObject({
      key: "hour",
      stem: "?",
      branch: "?",
      stemTenGod: "?",
      branchTenGod: "?",
    });
  });
});
