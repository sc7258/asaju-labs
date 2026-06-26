"use client";

import { memo } from "react";
import { InteractiveManselyeokChart } from "./interactive-manselyeok-chart";
import { compactBirthText } from "@repo/saju-core";
import { useBirthTextDraft } from "@repo/saju-core";
import type { ChasamPanelState } from "@repo/saju-core";

const PANEL_LABELS = {
  "buheoja-bonwon": "부허 본원",
  "buheoja-charyeok": "부허 차력",
  bonwon: "본원",
  charyeok: "차력",
  "heoja-bonwon": "허자 본원",
  "heoja-charyeok": "허자 차력",
} as const;

const LAST_ACCEPTED_PANELS_BY_BIRTHTEXT = new Map<
  string,
  ChasamPanelState[] | null
>();

interface ChasamManselyeokChartClientProps {
  panels: ChasamPanelState[] | null;
  inputBirthText: string;
  useDraftSnapshot?: boolean;
}

function ChasamManselyeokChartClientInner({
  panels,
  inputBirthText,
  useDraftSnapshot = true,
}: ChasamManselyeokChartClientProps) {
  const draftBirthText = useBirthTextDraft(inputBirthText);
  const payloadBirthText = compactBirthText(inputBirthText);

  if (!useDraftSnapshot) {
    return renderPanels(panels);
  }

  const isLatestPayload =
    draftBirthText.length === 0 || draftBirthText === payloadBirthText;

  if (isLatestPayload) {
    LAST_ACCEPTED_PANELS_BY_BIRTHTEXT.set(
      draftBirthText || payloadBirthText,
      panels,
    );
  }

  const displayedPanels = isLatestPayload
    ? panels
    : (LAST_ACCEPTED_PANELS_BY_BIRTHTEXT.get(draftBirthText) ?? panels);

  return renderPanels(displayedPanels);
}

function renderPanels(displayedPanels: ChasamPanelState[] | null) {
  if (!displayedPanels) {
    return (
      <section className="rounded-md border border-[#8a8a8a] bg-[#f1f1ee] p-3 text-center text-xs text-[#666]">
        결과 없음
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 md:gap-3">
      {displayedPanels.map((panel) => {
        return (
          <div
            className="rounded-xl"
            data-boncha-panel={panel.isBoncha ? "true" : "false"}
            key={panel.key}
          >
            <InteractiveManselyeokChart
              accentTone={panel.isBoncha ? "boncha" : "default"}
              defaultExpanded={false}
              displayProfileLabel={panel.isBoncha && panel.input.name && panel.input.name !== "홍길동" ? ${panel.input.name}  : PANEL_LABELS[panel.key]}
              input={panel.input}
              panelLabel={PANEL_LABELS[panel.key]}
              viewModel={panel.viewModel}
            />
          </div>
        );
      })}
    </section>
  );
}

export const ChasamManselyeokChartClient = memo(ChasamManselyeokChartClientInner);
