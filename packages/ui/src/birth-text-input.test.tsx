import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BirthTextInput,
  countDigitsBeforeSelection,
  getSelectionFromRawIndex,
  resolveAutoSubmitNavigationMode,
} from "./birth-text-input";
import { getBirthTextDraft, resetBirthTextDraft } from "@repo/saju-core";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe("BirthTextInput", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    mockPush.mockReset();
    mockReplace.mockReset();
    resetBirthTextDraft();
  });

  it("formats a date-only input while keeping the submitted value compact", async () => {
    const user = userEvent.setup();

    render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.type(input, "19720126");

    expect(input).toHaveValue("1972 0126");
    expect(screen.getByDisplayValue("19720126")).toHaveAttribute(
      "type",
      "hidden",
    );
  });

  it("자동 반영은 전체 새로고침 대신 클라이언트 라우팅으로 처리한다", async () => {
    vi.useFakeTimers();

    render(
      <form action="/">
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "19720126" } });
    vi.advanceTimersByTime(350);

    expect(mockPush).toHaveBeenCalledWith("/?birthText=19720126", {
      scroll: false,
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("편집 중에는 날짜 자동 반영 응답이 돌아와도 뒤에 입력하던 시간을 유지한다", async () => {
    const user = userEvent.setup();
    const view = render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.type(input, "1972012611");
    view.rerender(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1972 0126"
        />
      </form>,
    );

    expect(input).toHaveValue("1972 0126 11");
  });

  it("편집 중에는 시까지만 자동 반영된 00 보정도 입력창을 덮어쓰지 않는다", async () => {
    const user = userEvent.setup();
    const view = render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.type(input, "1972012611");
    view.rerender(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1972 0126 1100"
        />
      </form>,
    );

    expect(input).toHaveValue("1972 0126 11");
  });

  it("편집이 끝난 뒤 외부 이동으로 값이 바뀌면 서버 상태로 다시 맞춘다", async () => {
    const user = userEvent.setup();
    const view = render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1972 0126"
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.click(input);
    await user.tab();

    view.rerender(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1999 0529 1100"
        />
      </form>,
    );

    expect(input).toHaveValue("1999 0529 1100");
  });

  it("편집 중 백스페이스로 지운 값은 이전 서버값으로 되돌아가지 않는다", async () => {
    const user = userEvent.setup();
    const view = render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1972 0126"
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.click(input);
    await user.keyboard("{Backspace}");
    view.rerender(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue="1972 0126"
        />
      </form>,
    );

    expect(input).toHaveValue("1972 012");
  });

  it("입력창 draft는 차트가 참조할 수 있도록 최신 숫자로 유지한다", async () => {
    const user = userEvent.setup();

    render(
      <form>
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.type(input, "19780101");

    expect(getBirthTextDraft()).toBe("19780101");
  });

  it("키보드를 닫아 blur가 발생해도 이전처럼 별도 replace 확정을 시도하지 않는다", async () => {
    const user = userEvent.setup();

    render(
      <form action="/">
        <BirthTextInput
          className="test-input"
          defaultValue=""
        />
      </form>,
    );

    const input = screen.getByLabelText("생년월일시");

    await user.type(input, "19780101");
    fireEvent.blur(input);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("resolveAutoSubmitNavigationMode", () => {
  it("첫 자동 반영은 push로 처리한다", () => {
    expect(resolveAutoSubmitNavigationMode(null, 1_000)).toBe("push");
  });

  it("짧은 시간 안의 연속 자동 반영은 replace로 처리한다", () => {
    expect(resolveAutoSubmitNavigationMode(1_000, 2_500)).toBe("replace");
  });

  it("시간이 충분히 지나면 새로운 push로 처리한다", () => {
    expect(resolveAutoSubmitNavigationMode(1_000, 7_000)).toBe("push");
  });
});

describe("selection helpers", () => {
  it("표시 문자열 커서를 raw digit 인덱스로 바꾼다", () => {
    expect(countDigitsBeforeSelection("1972 0126 11", 0)).toBe(0);
    expect(countDigitsBeforeSelection("1972 0126 11", 4)).toBe(4);
    expect(countDigitsBeforeSelection("1972 0126 11", 5)).toBe(4);
    expect(countDigitsBeforeSelection("1972 0126 11", 10)).toBe(8);
    expect(countDigitsBeforeSelection("1972 0126 11", 12)).toBe(10);
  });

  it("raw digit 인덱스를 표시 문자열 커서로 되돌린다", () => {
    expect(getSelectionFromRawIndex("1972 0126 11", 0)).toBe(0);
    expect(getSelectionFromRawIndex("1972 0126 11", 4)).toBe(4);
    expect(getSelectionFromRawIndex("1972 0126 11", 5)).toBe(6);
    expect(getSelectionFromRawIndex("1972 0126 11", 8)).toBe(9);
    expect(getSelectionFromRawIndex("1972 0126 11", 10)).toBe(12);
  });
});
