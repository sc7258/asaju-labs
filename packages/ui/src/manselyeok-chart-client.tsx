"use client";

import { InteractiveManselyeokChart } from "./interactive-manselyeok-chart";
import type { ManselyeokInput, ManselyeokViewModel } from "@repo/saju-core";

export function ManselyeokChartClient({
  input,
  viewModel,
}: {
  input: ManselyeokInput;
  viewModel: ManselyeokViewModel | null;
}) {
  return (
    <InteractiveManselyeokChart
      defaultExpanded
      input={input}
      syncSelection
      viewModel={viewModel}
    />
  );
}
