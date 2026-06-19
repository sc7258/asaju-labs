import type { AnchorHTMLAttributes, ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChasamManselyeokChartClient } from "./chasam-manselyeok-chart-client";
import { resetBirthTextDraft, setBirthTextDraft } from "@repo/saju-core";
import { getChasamManselyeokPageState } from "@repo/saju-core";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    prefetch,
    scroll,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
    prefetch?: boolean | null;
    scroll?: boolean;
  }) => (
    (() => {
      void prefetch;
      void scroll;

      return (
        <a href={href} onClick={onClick} {...props}>
          {children}
        </a>
      );
    })()
  ),
}));

describe("ChasamManselyeokChartClient", () => {
  afterEach(() => {
    resetBirthTextDraft();
  });

  it("기본 상태에서는 6판이 접혀 있고, 펼치면 대운/세운이 보인다", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    act(() => {
      setBirthTextDraft("197201261130");
    });

    render(
      <ChasamManselyeokChartClient
        panels={state.panels}
        inputBirthText={state.input.birthText}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("부허 본원")).toBeInTheDocument();
    expect(screen.getByText("부허 차력")).toBeInTheDocument();
    expect(screen.getByText("본원")).toBeInTheDocument();
    expect(screen.getByText("차력")).toBeInTheDocument();
    expect(screen.getByText("허자 본원")).toBeInTheDocument();
    expect(screen.getByText("허자 차력")).toBeInTheDocument();

    expect(document.querySelectorAll('[data-boncha-panel="true"]')).toHaveLength(2);

    const user = userEvent.setup();

    await user.click(screen.getByText("본원"));

    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);

    await user.click(screen.getByText("본원"));

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("현재 draft보다 오래된 응답은 현재 차트를 덮어쓰지 않는다", async () => {
    const firstState = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });
    const latestState = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "199905291100",
    });

    act(() => {
      setBirthTextDraft("197201261130");
    });

    const view = render(
      <ChasamManselyeokChartClient
        panels={firstState.panels}
        inputBirthText={firstState.input.birthText}
      />,
    );

    act(() => {
      setBirthTextDraft("199905291100");
    });
    view.rerender(
      <ChasamManselyeokChartClient
        panels={latestState.panels}
        inputBirthText={latestState.input.birthText}
      />,
    );

    expect(screen.getByText("양 1999-05-29")).toBeInTheDocument();

    view.rerender(
      <ChasamManselyeokChartClient
        panels={firstState.panels}
        inputBirthText={firstState.input.birthText}
      />,
    );

    expect(screen.getByText("양 1999-05-29")).toBeInTheDocument();
    expect(screen.queryByText("양 1972-01-26")).not.toBeInTheDocument();
  });
});
