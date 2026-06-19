import { describe, expect, it } from "vitest";
import {
  buildManselyeokShareDescription,
  buildOgImageUrl,
  flattenSearchParams,
} from "./manselyeok-share";

describe("flattenSearchParams", () => {
  it("searchParams를 단일 문자열 값으로 평탄화한다", () => {
    expect(
      flattenSearchParams({
        birthText: ["199005151430"],
        gender: "male",
        empty: undefined,
      }),
    ).toEqual({
      birthText: "199005151430",
      gender: "male",
    });
  });
});

describe("buildOgImageUrl", () => {
  it("현재 입력 파라미터를 포함한 OG 이미지 URL을 만든다", () => {
    expect(
      buildOgImageUrl(
        {
          birthText: "199005151430",
          gender: "male",
          calendarType: "solar",
        },
        "https://example.com",
      ),
    ).toBe(
      "https://example.com/api/og?birthText=199005151430&gender=male&calendarType=solar",
    );
  });
});

describe("buildManselyeokShareDescription", () => {
  it("시간 모름 상태를 포함한 공유 설명을 만든다", () => {
    expect(
      buildManselyeokShareDescription({
        input: {
          name: "홍길동",
          birthText: "1990 0515",
          year: 1990,
          month: 5,
          day: 15,
          hour: null,
          minute: null,
          gender: "male",
          calendarType: "lunar",
          isLeapMonth: true,
          showDetails: false,
          showLuckDividers: false,
          useBoardBackground: false,
        },
        errors: [],
        viewModel: {
          name: "홍길동",
          genderLabel: "남",
          showDetails: false,
          showLuckDividers: false,
          useBoardBackground: false,
          profileLabel: "남 이름없음",
          age: 36,
          ageLabel: "만 36세",
          solarLabel: "1990.05.15 12:00",
          solarSummaryLabel: "양 1990-05-15",
          lunarSummaryLabel: "윤 1990-04-21",
          lunarLabel: "1990.04.21",
          calendarLabel: "음력 기준 입력 (윤달)",
          pillars: [],
          majorLuck: [],
          yearlyLuck: [],
          yearlyLuckByMajorStartAge: {},
          currentYear: 2026,
          currentMajorLuck: null,
          selectedMajorLuck: null,
          startAgeLabel: "8세 시작 (순행)",
          skyNoble: "丑 未",
          skyNobleHits: "년 월",
          gongmang: "申 酉",
          gongmangHits: "일 시",
        },
      }),
    ).toBe("1990 0515 · 남 · 음력 윤달 · 시간 모름");
  });
});
