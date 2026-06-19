import { describe, expect, it } from "vitest";
import { shiftBirthTextByDays } from "@/lib/date-navigation";

describe("shiftBirthTextByDays", () => {
  it("양력 입력을 하루 뒤로 이동하면서 시간을 유지한다", () => {
    expect(
      shiftBirthTextByDays({
        birthText: "199005151430",
        calendarSelection: "solar",
        dayDelta: 1,
      }),
    ).toEqual({
      birthText: "199005161430",
      calendarSelection: "solar",
    });
  });

  it("윤달 입력을 하루 앞으로 이동하면서 윤달 상태를 유지한다", () => {
    expect(
      shiftBirthTextByDays({
        birthText: "20230201",
        calendarSelection: "lunar-leap",
        dayDelta: 1,
      }),
    ).toEqual({
      birthText: "20230202",
      calendarSelection: "lunar-leap",
    });
  });
});
