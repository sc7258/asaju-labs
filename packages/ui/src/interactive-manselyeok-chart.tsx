"use client";

import { useState } from "react";
import { ManselyeokChart } from "./manselyeok-chart";
import type {
  DisplayLuckPillar,
  DisplayYearLuck,
  ManselyeokInput,
  ManselyeokViewModel,
} from "@repo/saju-core";

function getSelectedYear(viewModel: ManselyeokViewModel) {
  return viewModel.yearlyLuck.find((item) => item.isSelected)?.year ?? null;
}

function getDefaultYearForMajorLuck(
  viewModel: ManselyeokViewModel,
  selectedMajorLuckStartAge: number | null,
) {
  if (selectedMajorLuckStartAge === null) {
    return null;
  }

  return (
    viewModel.yearlyLuckByMajorStartAge[String(selectedMajorLuckStartAge)]
      ?.find((item) => item.isSelected)?.year ?? null
  );
}

function resolveSelectedMajorLuck(
  majorLuck: DisplayLuckPillar[],
  selectedMajorLuckStartAge: number | null,
) {
  return (
    majorLuck.find((item) => item.startAge === selectedMajorLuckStartAge) ?? null
  );
}

function resolveYearlyLuck(
  source: DisplayYearLuck[],
  selectedYear: number | null,
) {
  const fallbackSelectedYear =
    source.find((item) => item.isSelected)?.year ?? source[0]?.year ?? null;
  const resolvedSelectedYear = source.some((item) => item.year === selectedYear)
    ? selectedYear
    : fallbackSelectedYear;

  return source.map((item) => ({
    ...item,
    isSelected: item.year === resolvedSelectedYear,
  }));
}

function applyLuckSelection(
  viewModel: ManselyeokViewModel,
  selectedMajorLuckStartAge: number | null,
  selectedYear: number | null,
): ManselyeokViewModel {
  const majorLuck = viewModel.majorLuck.map((item) => ({
    ...item,
    isSelected: item.startAge === selectedMajorLuckStartAge,
  }));
  const selectedMajorLuck = resolveSelectedMajorLuck(
    majorLuck,
    selectedMajorLuckStartAge,
  );
  const yearlyLuckSource = selectedMajorLuck
    ? (viewModel.yearlyLuckByMajorStartAge[String(selectedMajorLuck.startAge)] ?? [])
    : [];

  return {
    ...viewModel,
    majorLuck,
    selectedMajorLuck,
    yearlyLuck: resolveYearlyLuck(yearlyLuckSource, selectedYear),
  };
}

function syncSelectionInUrl(
  selectedMajorLuckStartAge: number | null,
  selectedYear: number | null,
) {
  const url = new URL(window.location.href);

  if (selectedMajorLuckStartAge === null) {
    url.searchParams.delete("selectedMajorLuckStartAge");
    url.searchParams.delete("selectedYear");
  } else {
    url.searchParams.set(
      "selectedMajorLuckStartAge",
      String(selectedMajorLuckStartAge),
    );

    if (selectedYear === null) {
      url.searchParams.delete("selectedYear");
    } else {
      url.searchParams.set("selectedYear", String(selectedYear));
    }
  }

  const search = url.searchParams.toString();
  const nextUrl = search ? `${url.pathname}?${search}` : url.pathname;

  window.history.replaceState(null, "", nextUrl);
}

export function InteractiveManselyeokChart({
  input,
  viewModel,
  defaultExpanded = true,
  panelLabel,
  displayProfileLabel,
  syncSelection = false,
  accentTone = "default",
}: {
  input: ManselyeokInput;
  viewModel: ManselyeokViewModel | null;
  defaultExpanded?: boolean;
  panelLabel?: string;
  displayProfileLabel?: string;
  syncSelection?: boolean;
  accentTone?: "default" | "boncha";
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedMajorLuckStartAge, setSelectedMajorLuckStartAge] = useState<
    number | null
  >(viewModel?.selectedMajorLuck?.startAge ?? null);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    viewModel ? getSelectedYear(viewModel) : null,
  );

  if (!viewModel) {
    return <ManselyeokChart input={input} viewModel={viewModel} />;
  }

  const resolvedViewModel = viewModel;
  const displayedViewModel = applyLuckSelection(
    resolvedViewModel,
    selectedMajorLuckStartAge,
    selectedYear,
  );

  function handleMajorLuckSelect(nextSelectedMajorLuckStartAge: number) {
    const nextSelectedYear = getDefaultYearForMajorLuck(
      resolvedViewModel,
      nextSelectedMajorLuckStartAge,
    );

    setSelectedMajorLuckStartAge(nextSelectedMajorLuckStartAge);
    setSelectedYear(nextSelectedYear);

    if (syncSelection) {
      syncSelectionInUrl(nextSelectedMajorLuckStartAge, nextSelectedYear);
    }
  }

  function handleYearlyLuckSelect(nextSelectedYear: number) {
    setSelectedYear(nextSelectedYear);

    if (syncSelection) {
      syncSelectionInUrl(selectedMajorLuckStartAge, nextSelectedYear);
    }
  }

  return (
    <ManselyeokChart
      accentTone={accentTone}
      displayProfileLabel={displayProfileLabel}
      expanded={isExpanded}
      input={input}
      onSelectMajorLuck={handleMajorLuckSelect}
      onSelectYearlyLuck={handleYearlyLuckSelect}
      onToggleExpanded={() => setIsExpanded((current) => !current)}
      panelLabel={panelLabel}
      viewModel={displayedViewModel}
    />
  );
}
