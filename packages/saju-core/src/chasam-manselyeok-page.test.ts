import { describe, expect, it } from "vitest";
import { getChasamManselyeokPageState } from "./chasam-manselyeok-page";

describe("getChasamManselyeokPageState", () => {
  it("차샘만세력 6판을 부허자, 본원/차력, 허자 순서로 만든다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    expect(state.errors).toEqual([]);
    expect(state.panels?.map((panel) => panel.key)).toEqual([
      "buheoja-bonwon",
      "buheoja-charyeok",
      "bonwon",
      "charyeok",
      "heoja-bonwon",
      "heoja-charyeok",
    ]);
    expect(state.panels?.map((panel) => panel.isBoncha)).toEqual([
      false,
      false,
      true,
      true,
      false,
      false,
    ]);

    const panelDates = state.panels?.map((panel) => panel.viewModel.solarSummaryLabel);

    expect(panelDates).toEqual([
      "양 1971-10-24",
      "양 1971-12-11",
      "양 1972-01-26",
      "양 1972-03-11",
      "양 1972-04-24",
      "양 1972-06-05",
    ]);
  });

  it("음력 1976-10-28 07:00 입력으로 6개의 사주를 만든다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "lunar",
      birthText: "197610280700",
    });

    expect(state.errors).toEqual([]);
    expect(state.input.calendarType).toBe("lunar");
    expect(state.input.birthText).toBe("1976 1028 0700");

    const panelDates = state.panels?.map((panel) => panel.viewModel.solarSummaryLabel);

    expect(panelDates).toEqual([
      "양 1976-09-06",
      "양 1976-10-28",
      "양 1976-12-19",
      "양 1977-02-06",
      "양 1977-03-25",
      "양 1977-05-12",
    ]);
  });

  it("양력 1999-05-29 입력도 부허자 보정 후 6개의 사주를 만든다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "19990529",
    });

    expect(state.errors).toEqual([]);

    const panelDates = state.panels?.map((panel) => panel.viewModel.solarSummaryLabel);

    expect(panelDates?.slice(0, 3)).toEqual([
      "양 1999-03-01",
      "양 1999-04-15",
      "양 1999-05-29",
    ]);
  });

  it("양력 1999-05-29 11:00 입력은 오전 부허자 보정으로 6개의 사주를 만든다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "박지훈",
      gender: "male",
      calendarType: "solar",
      birthText: "199905291100",
    });

    expect(state.errors).toEqual([]);
    expect(state.input.name).toBe("박지훈");
    expect(state.input.birthText).toBe("1999 0529 1100");

    const panelDates = state.panels?.map((panel) => panel.viewModel.solarSummaryLabel);

    expect(panelDates).toEqual([
      "양 1999-02-28",
      "양 1999-04-15",
      "양 1999-05-29",
      "양 1999-07-12",
      "양 1999-08-22",
      "양 1999-10-01",
    ]);
  });

  it("양력 1970-11-30 18:00 입력으로 6개의 사주를 만든다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197011301800",
    });

    expect(state.errors).toEqual([]);

    const panelDates = state.panels?.map((panel) => panel.viewModel.solarSummaryLabel);

    expect(panelDates).toEqual([
      "양 1970-10-04",
      "양 1970-11-02",
      "양 1970-11-30",
      "양 1970-12-28",
      "양 1971-01-24",
      "양 1971-02-19",
    ]);
  });
});
