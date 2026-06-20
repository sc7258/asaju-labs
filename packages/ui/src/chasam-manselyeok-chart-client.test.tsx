import type { AnchorHTMLAttributes, ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChasamManselyeokChartClient } from "./chasam-manselyeok-chart-client";
import {
  getChasamManselyeokPageState,
  resetBirthTextDraft,
  setBirthTextDraft,
} from "@repo/saju-core";

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

  it("renders six panels and toggles the expanded content", async () => {
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
        inputBirthText={state.input.birthText}
        panels={state.panels}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(screen.queryAllByRole("link")).toHaveLength(0);

    const user = userEvent.setup();

    await user.click(screen.getByText("본원"));
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);

    await user.click(screen.getByText("본원"));
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("keeps the latest accepted panels while the draft is ahead of the payload", async () => {
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
        inputBirthText={firstState.input.birthText}
        panels={firstState.panels}
      />,
    );

    act(() => {
      setBirthTextDraft("199905291100");
    });

    view.rerender(
      <ChasamManselyeokChartClient
        inputBirthText={latestState.input.birthText}
        panels={latestState.panels}
      />,
    );

    expect(screen.getByText(/1999-05-29/)).toBeInTheDocument();

    view.rerender(
      <ChasamManselyeokChartClient
        inputBirthText={firstState.input.birthText}
        panels={firstState.panels}
      />,
    );

    expect(screen.getByText(/1999-05-29/)).toBeInTheDocument();
    expect(screen.queryByText(/1972-01-26/)).not.toBeInTheDocument();
  });

  it("does not let neighboring charts follow the active birth-text draft", async () => {
    const currentState = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "199905291100",
    });
    const neighborState = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    act(() => {
      setBirthTextDraft("199905291100");
    });

    render(
      <div>
        <ChasamManselyeokChartClient
          inputBirthText={currentState.input.birthText}
          panels={currentState.panels}
        />
        <ChasamManselyeokChartClient
          inputBirthText={neighborState.input.birthText}
          panels={neighborState.panels}
          useDraftSnapshot={false}
        />
      </div>,
    );

    expect(screen.getAllByText(/1999-05-29/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1972-01-26/).length).toBeGreaterThan(0);
  });
});
