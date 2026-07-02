import type { MouseEvent } from "react";
import Link from "next/link";
import { compactBirthText } from "@repo/saju-core";
import type {
  DisplayLuckPillar,
  DisplayPillar,
  DisplayYearLuck,
  ManselyeokInput,
  ManselyeokViewModel,
} from "@repo/saju-core";

import { DaewoonTimeline } from "./daewoon-timeline";
import { SewoonList } from "./sewoon-list";
import { BirthSummary } from "./birth-summary";
import { SideBadge } from "./side-badge";

import { elementTheme } from "./theme";

function CharacterTile({
  char,
  theme,
}: {
  char: string;
  theme: string;
}) {
  return (
    <div
      className={`flex aspect-square w-full items-center justify-center rounded-[5px] border text-[24px] font-semibold sm:text-[28px] ${theme}`}
    >
      {char}
    </div>
  );
}



function PillarStrip({
  pillar,
  showDetails,
}: {
  pillar: DisplayPillar;
  showDetails: boolean;
}) {
  const unknownTileTheme = "bg-[#f5f2ee] text-[#8f8b86] border-[#cdc4ba]";
  const stemTheme = pillar.stemElement
    ? elementTheme[pillar.stemElement].strong
    : unknownTileTheme;
  const branchTheme = pillar.branchElement
    ? elementTheme[pillar.branchElement].soft
    : unknownTileTheme;

  return (
    <div className="space-y-[2px]">
      {showDetails ? (
        <div className="flex min-h-[10px] items-center justify-center text-center text-[8px] font-semibold tracking-[-0.02em] text-[#b3aaa0] sm:text-[9px]">
          {pillar.title}
        </div>
      ) : null}
      <div className="flex min-h-[11px] items-center justify-center text-center text-[9px] font-semibold text-[#9bb0c2]">
        {pillar.stemTenGod}
      </div>
      <CharacterTile char={pillar.stem} theme={stemTheme} />
      <CharacterTile char={pillar.branch} theme={branchTheme} />
      <div className="flex min-h-[11px] items-center justify-center text-center text-[9px] font-semibold text-[#7b85a1]">
        {pillar.branchTenGod}
      </div>
    </div>
  );
}

function ChartRowHeader({
  label,
  detail,
}: {
  label: string;
  detail?: string;
}) {
  return (
    <div className="mb-[4px] flex items-center justify-between gap-3 px-[2px]">
      <div className="text-[10px] font-semibold tracking-[-0.02em] text-[#6f675e] sm:text-[11px]">
        {label}
      </div>
      {detail ? (
        <div className="text-[9px] leading-none text-[#9a9086] sm:text-[10px]">
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function ExpandToggleButton({
  expanded,
  onToggle,
  panelLabel,
}: {
  expanded: boolean;
  onToggle: () => void;
  panelLabel?: string;
}) {
  return (
    <button
      aria-label={`${panelLabel ?? "만세력"} ${expanded ? "접기" : "펼치기"}`}
      className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d8e1ec] bg-[#fffefd] text-[12px] font-semibold leading-none text-[#7b8ca2] shadow-[0_2px_6px_rgba(95,81,58,0.06)] transition-colors hover:border-[#b8cada] hover:text-[#5f7995] sm:h-6 sm:w-6 sm:text-[13px]"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      type="button"
    >
      {expanded ? (
        <svg
          aria-hidden="true"
          className="h-2.5 w-2.5 sm:h-3 sm:w-3"
          fill="none"
          viewBox="0 0 24 24"
        >
          <polyline
            points="4 14 10 14 10 20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="20 10 14 10 14 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="14"
            x2="21"
            y1="10"
            y2="3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="3"
            x2="10"
            y1="21"
            y2="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="14 20 14 14 20 14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="10 4 10 10 4 10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="14"
            x2="21"
            y1="14"
            y2="21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="3"
            x2="10"
            y1="3"
            y2="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-2.5 w-2.5 sm:h-3 sm:w-3"
          fill="none"
          viewBox="0 0 24 24"
        >
          <polyline
            points="15 3 21 3 21 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="9 21 3 21 3 15"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="21"
            x2="14"
            y1="3"
            y2="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="3"
            x2="10"
            y1="21"
            y2="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="21 15 21 21 15 21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <polyline
            points="3 9 3 3 9 3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="21"
            x2="14"
            y1="21"
            y2="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <line
            x1="3"
            x2="10"
            y1="3"
            y2="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </button>
  );
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}



function buildMajorLuckHref(
  input: ManselyeokInput,
  selectedMajorLuckStartAge: number,
) {
  const params = new URLSearchParams({
    birthText: compactBirthText(input.birthText),
    gender: input.gender,
    calendarType: input.calendarType,
    isLeapMonth: input.isLeapMonth ? "true" : "false",
    selectedMajorLuckStartAge: String(selectedMajorLuckStartAge),
  });

  if (input.showDetails) {
    params.set("showDetails", "true");
  }
  if (input.showLuckDividers) {
    params.set("showLuckDividers", "true");
  }
  if (input.useBoardBackground) {
    params.set("useBoardBackground", "true");
  }

  return `/?${params.toString()}`;
}

function buildYearlyLuckHref(
  input: ManselyeokInput,
  selectedMajorLuckStartAge: number | null,
  selectedYear: number,
) {
  const params = new URLSearchParams({
    birthText: compactBirthText(input.birthText),
    gender: input.gender,
    calendarType: input.calendarType,
    isLeapMonth: input.isLeapMonth ? "true" : "false",
    selectedYear: String(selectedYear),
  });

  if (selectedMajorLuckStartAge !== null) {
    params.set("selectedMajorLuckStartAge", String(selectedMajorLuckStartAge));
  }

  if (input.showDetails) {
    params.set("showDetails", "true");
  }
  if (input.showLuckDividers) {
    params.set("showLuckDividers", "true");
  }
  if (input.useBoardBackground) {
    params.set("useBoardBackground", "true");
  }

  return `/?${params.toString()}`;
}

export function ManselyeokChart({
  viewModel,
  input,
  onSelectMajorLuck,
  onSelectYearlyLuck,
  expanded = true,
  onToggleExpanded,
  panelLabel,
  displayProfileLabel,
  accentTone = "default",
}: {
  viewModel: ManselyeokViewModel | null;
  input: ManselyeokInput;
  onSelectMajorLuck?: (selectedMajorLuckStartAge: number) => void;
  onSelectYearlyLuck?: (selectedYear: number) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  panelLabel?: string;
  displayProfileLabel?: string;
  accentTone?: "default" | "boncha";
}) {
  if (!viewModel) {
    return (
      <section className="rounded-md border border-[#8a8a8a] bg-[#f1f1ee] p-3 text-center text-xs text-[#666]">
        결과 없음
      </section>
    );
  }

  const majorLuckItems = viewModel.majorLuck.map((item) => ({
    ...item,
    marker: `${item.startAge}-${item.pillar}`,
    topLabel: String(item.startAge),
    isHighlighted: item.isSelected,
    href: buildMajorLuckHref(input, item.startAge),
    onSelect: onSelectMajorLuck
      ? () => onSelectMajorLuck(item.startAge)
      : undefined,
  }));

  const yearlyLuckItems = viewModel.yearlyLuck.map((item) => ({
    ...item,
    marker: `${item.year}-${item.pillar}`,
    topLabel: String(item.year),
    isHighlighted: item.isSelected,
    href: buildYearlyLuckHref(
      input,
      viewModel.selectedMajorLuck?.startAge ?? null,
      item.year,
    ),
    onSelect: onSelectYearlyLuck ? () => onSelectYearlyLuck(item.year) : undefined,
  }));
  const selectedMajorLuckRangeLabel = viewModel.selectedMajorLuck
    ? `${viewModel.selectedMajorLuck.startAge}-${viewModel.selectedMajorLuck.endAge}세 구간`
    : undefined;
  const showDetails = input.showDetails;
  const showLuckDividers = input.showLuckDividers;
  const useBoardBackground = input.useBoardBackground;
  const borderClass =
    accentTone === "boncha" ? "border-blue-200/50" : "border-white/60";
  const shadowClass =
    accentTone === "boncha"
      ? "shadow-[0_16px_40px_rgba(65,110,170,0.15)]"
      : "shadow-[0_8px_32px_rgba(0,0,0,0.05)]";
  
  const isLeapMonth = input.isLeapMonth === true;
  const boardClass = isLeapMonth
    ? "bg-gradient-to-br from-[#f8f9fc]/80 to-[#f1f4f9]/80 backdrop-blur-xl shadow-[inset_0_0_40px_rgba(109,117,145,0.06)]"
    : useBoardBackground
      ? "bg-white/40 backdrop-blur-xl"
      : "bg-white/50 backdrop-blur-xl";
  const topSectionClass = accentTone === "boncha"
    ? "bg-white/60"
    : isLeapMonth 
      ? "bg-white/30"
      : useBoardBackground
        ? "bg-white/40"
        : "bg-white/50";
  const lowerSectionClass = accentTone === "boncha"
    ? "bg-white/40"
    : isLeapMonth
      ? "bg-transparent"
      : useBoardBackground
        ? "bg-white/20"
        : "bg-white/30";

  return (
    <section
      className={`relative select-none overflow-hidden rounded-3xl border ${borderClass} ${shadowClass} ${boardClass}`}
    >
      {isLeapMonth && (
         <div className="pointer-events-none absolute -left-10 -top-10 z-0 h-40 w-40 rounded-full bg-[#b8c2d6] opacity-20 blur-3xl mix-blend-multiply"></div>
      )}
      {onToggleExpanded ? (
        <div className="absolute right-1.5 top-1.5 z-[2] sm:right-2 sm:top-2">
          <ExpandToggleButton
            expanded={expanded}
            onToggle={onToggleExpanded}
            panelLabel={panelLabel}
          />
        </div>
      ) : null}
      <div
        className={`p-[3px] sm:p-[4px] ${topSectionClass} ${
          onToggleExpanded ? "cursor-pointer" : ""
        } ${
          expanded && showLuckDividers ? "border-b border-white/40" : ""
        }`}
        onClick={onToggleExpanded}
      >
        <div className="grid grid-cols-[80px_38px_38px_38px_38px] items-end justify-center gap-[2px] sm:grid-cols-[100px_48px_48px_48px_48px] sm:gap-[4px]">
          <div className="flex h-full flex-col justify-end gap-[2px] sm:gap-[3px]">
            <BirthSummary
              profileLabel={displayProfileLabel ?? viewModel.profileLabel}
              lunarSummaryLabel={viewModel.lunarSummaryLabel}
              solarSummaryLabel={viewModel.solarSummaryLabel}
            />
            <div className="grid grid-cols-2 gap-[2px] sm:gap-[4px]">
              <SideBadge
                hint={viewModel.skyNobleHits}
                label="천을귀인"
                showDetails={showDetails}
                value={viewModel.skyNoble}
                accent="water"
              />
              <SideBadge
                hint={viewModel.gongmangHits}
                label="공망"
                showDetails={showDetails}
                value={viewModel.gongmang}
                accent="fire"
              />
            </div>
          </div>
          {viewModel.pillars.map((pillar) => (
            <PillarStrip
              key={pillar.key}
              pillar={pillar}
              showDetails={showDetails}
            />
          ))}
        </div>
      </div>

      {expanded ? (
        <>
          <div
            className={`px-[4px] py-[4px] ${lowerSectionClass} ${
              showLuckDividers ? "border-b border-white/30" : ""
            }`}
          >
            <DaewoonTimeline
              startAgeLabel={viewModel.startAgeLabel}
              items={majorLuckItems}
              showDetails={showDetails}
              headerElement={<ChartRowHeader detail={viewModel.startAgeLabel} label="대운" />}
            />
          </div>

          <div className={`px-[4px] py-[4px] ${lowerSectionClass}`}>
            <SewoonList
              rangeLabel={selectedMajorLuckRangeLabel ?? ""}
              items={yearlyLuckItems}
              showDetails={showDetails}
              headerElement={<ChartRowHeader detail={selectedMajorLuckRangeLabel} label="세운" />}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
