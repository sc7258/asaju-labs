import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ManselyeokChartClient } from "./manselyeok-chart-client";
import {
  DEFAULT_MANSELYEOK_INPUT,
  createManselyeokViewModel,
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

function findLuckLink(label: string) {
  return screen
    .getAllByRole("link")
    .find((link) => link.textContent?.includes(label));
}

describe("ManselyeokChartClient", () => {
  it("switches the yearly luck row immediately when a different major luck is selected", async () => {
    const viewModel = await createManselyeokViewModel(DEFAULT_MANSELYEOK_INPUT);
    const currentMajorLuckStartAge = viewModel.selectedMajorLuck?.startAge ?? null;
    const nextMajorLuck = viewModel.majorLuck.find(
      (item) => item.startAge !== currentMajorLuckStartAge,
    );

    expect(nextMajorLuck).toBeDefined();

    const nextYearlyLuck =
      viewModel.yearlyLuckByMajorStartAge[String(nextMajorLuck?.startAge)];
    const initialYears = new Set(viewModel.yearlyLuck.map((item) => item.year));
    const uniqueNextYear =
      nextYearlyLuck?.find((item) => !initialYears.has(item.year))?.year ??
      nextYearlyLuck?.[0]?.year;
    const defaultSelectedYear =
      nextYearlyLuck?.find((item) => item.isSelected)?.year ?? null;

    window.history.replaceState(
      {},
      "",
      "/?gender=male&calendarType=solar&birthText=199005151430",
    );

    render(
      <ManselyeokChartClient
        input={DEFAULT_MANSELYEOK_INPUT}
        viewModel={viewModel}
      />,
    );

    const user = userEvent.setup();
    const majorLuckLink = findLuckLink(String(nextMajorLuck?.startAge));

    expect(majorLuckLink).toBeDefined();

    await user.click(majorLuckLink!);

    expect(screen.getByText(String(uniqueNextYear))).toBeInTheDocument();
    expect(window.location.search).toContain(
      `selectedMajorLuckStartAge=${nextMajorLuck?.startAge}`,
    );
    expect(window.location.search).toContain(`selectedYear=${defaultSelectedYear}`);
  });

  it("updates the current URL when a yearly luck is selected", async () => {
    const viewModel = await createManselyeokViewModel(DEFAULT_MANSELYEOK_INPUT);
    const nextYear = viewModel.yearlyLuck.find((item) => !item.isSelected)?.year;

    expect(nextYear).toBeDefined();

    window.history.replaceState(
      {},
      "",
      "/?gender=male&calendarType=solar&birthText=199005151430",
    );

    render(
      <ManselyeokChartClient
        input={DEFAULT_MANSELYEOK_INPUT}
        viewModel={viewModel}
      />,
    );

    const user = userEvent.setup();
    const yearlyLuckLink = findLuckLink(String(nextYear));

    expect(yearlyLuckLink).toBeDefined();

    await user.click(yearlyLuckLink!);

    expect(window.location.search).toContain(`selectedYear=${nextYear}`);
  });
});
