import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryNavButton } from "./history-nav-button";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: () => undefined,
    refresh: () => undefined,
  }),
}));

describe("HistoryNavButton", () => {
  beforeEach(() => {
    mockPush.mockReset();
    window.history.replaceState(
      {},
      "",
      "/?showDetails=true&selectedYear=2026",
    );
  });

  it("전날 버튼 클릭 시 현재 birthText를 전날로 이동한 URL로 이동한다", () => {
    render(
      <form>
        <select defaultValue="solar" name="calendarType">
          <option value="solar">양력</option>
        </select>
        <input name="birthText" type="hidden" value="199005151430" />
        <HistoryNavButton direction="previous" />
      </form>,
    );

    fireEvent.click(screen.getByLabelText("전날"));

    expect(mockPush).toHaveBeenCalledWith(
      "/?showDetails=true&selectedYear=2026&calendarType=solar&birthText=199005141430",
      { scroll: false },
    );
  });

  it("다음날 버튼 클릭 시 윤달 보정을 반영한 URL로 이동한다", () => {
    render(
      <form>
        <select defaultValue="lunar-leap" name="calendarType">
          <option value="solar">양력</option>
          <option value="lunar">음력</option>
          <option value="lunar-leap">윤달</option>
        </select>
        <input name="birthText" type="hidden" value="20230201" />
        <HistoryNavButton direction="next" />
      </form>,
    );

    fireEvent.click(screen.getByLabelText("다음날"));

    expect(mockPush).toHaveBeenCalledWith(
      "/?showDetails=true&selectedYear=2026&calendarType=lunar-leap&birthText=20230202",
      { scroll: false },
    );
  });
});
