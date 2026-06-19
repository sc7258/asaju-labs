import { ImageResponse } from "next/og";
import { getBranchElement, getStemElement } from "@gracefullight/saju";
import {
  getChasamManselyeokPageState,
  type ChasamManselyeokPageState,
  type ChasamPanelKey,
  type ChasamPanelState,
} from "@repo/saju-core-page";
import type { DisplayLuckPillar, DisplayPillar } from "@repo/saju-core";

export const runtime = "nodejs";

const size = {
  width: 1200,
  height: 630,
} as const;

const PANEL_ORDER: ChasamPanelKey[] = [
  "buheoja-bonwon",
  "buheoja-charyeok",
  "bonwon",
  "charyeok",
  "heoja-bonwon",
  "heoja-charyeok",
];

function getElementPalette(element: ReturnType<typeof getStemElement> | null) {
  if (element === "wood") {
    return { strong: "#93d5b1", soft: "#a8dfbf", border: "#7dc79f", text: "#ffffff" };
  }

  if (element === "fire") {
    return { strong: "#e66d8f", soft: "#e7849d", border: "#da5f82", text: "#ffffff" };
  }

  if (element === "earth") {
    return { strong: "#f0c969", soft: "#f2cf78", border: "#e2bb57", text: "#ffffff" };
  }

  if (element === "metal") {
    return { strong: "#fbfdff", soft: "#ffffff", border: "#afc9f2", text: "#67718e" };
  }

  if (element === "water") {
    return { strong: "#6d7591", soft: "#77809a", border: "#5e6785", text: "#ffffff" };
  }

  return { strong: "#f5f2ee", soft: "#f5f2ee", border: "#cdc4ba", text: "#8f8b86" };
}

function BrandIconTile({ background, border }: { background: string; border: string }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        borderRadius: 9,
        border: `3px solid ${border}`,
        backgroundColor: background,
      }}
    />
  );
}

function BrandIcon() {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        aria-label="SajuCube icon"
        role="img"
        style={{
          display: "flex",
          width: 90,
          height: 90,
          padding: 12,
          boxSizing: "border-box",
          borderRadius: 26,
          backgroundColor: "#f8f2e8",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              gap: 5,
            }}
          >
            <BrandIconTile background="#93d5b1" border="#7dc79f" />
            <BrandIconTile background="#e66d8f" border="#da5f82" />
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              gap: 5,
            }}
          >
            <BrandIconTile background="#f0c969" border="#e2bb57" />
            <BrandIconTile background="#6d7591" border="#5e6785" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterTile({
  char,
  variant,
  element,
}: {
  char: string;
  variant: "stem" | "branch";
  element: ReturnType<typeof getStemElement> | ReturnType<typeof getBranchElement> | null;
}) {
  const palette = getElementPalette(element);

  return (
    <div
      style={{
        display: "flex",
        width: 110,
        height: 110,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        border: `2px solid ${palette.border}`,
        backgroundColor: variant === "stem" ? palette.strong : palette.soft,
        color: palette.text,
        fontSize: 68,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {char}
    </div>
  );
}

export function getOgDayPillar(pillars: DisplayPillar[]) {
  return pillars.find((pillar) => pillar.key === "day") ?? null;
}

export function getOrderedOgPanels(state: ChasamManselyeokPageState) {
  return [...(state.panels ?? [])]
    .sort((left, right) => PANEL_ORDER.indexOf(left.key) - PANEL_ORDER.indexOf(right.key));
}

export function getBonwonMajorLuck(state: ChasamManselyeokPageState) {
  return getOrderedOgPanels(state).find((panel) => panel.key === "bonwon")?.viewModel.majorLuck ?? [];
}

function DayPillarCard({ panel }: { panel: ChasamPanelState }) {
  const pillar = getOgDayPillar(panel.viewModel.pillars);

  if (!pillar) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <CharacterTile char={pillar.stem} element={pillar.stemElement} variant="stem" />
      <CharacterTile char={pillar.branch} element={pillar.branchElement} variant="branch" />
    </div>
  );
}

function DayPillarRow({ panels }: { panels: ChasamPanelState[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: 800,
      }}
    >
      {panels.map((panel) => (
        <DayPillarCard key={panel.key} panel={panel} />
      ))}
    </div>
  );
}

function MajorLuckColumn({ pillar }: { pillar: DisplayLuckPillar }) {
  const stemPalette = getElementPalette(getStemElement(pillar.stem));
  const branchPalette = getElementPalette(getBranchElement(pillar.branch));
  const borderColor = pillar.isCurrent ? "#5aa9da" : "#d8cfc2";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 92,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: pillar.isCurrent ? "#236e9a" : "#5f5145",
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {String(pillar.startAge)}
      </div>
      <div
        style={{
          display: "flex",
          width: 85,
          height: 85,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          border: `2px solid ${borderColor}`,
          backgroundColor: stemPalette.soft,
          color: stemPalette.text,
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {pillar.stem}
      </div>
      <div
        style={{
          display: "flex",
          width: 85,
          height: 85,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          border: `2px solid ${borderColor}`,
          backgroundColor: branchPalette.soft,
          color: branchPalette.text,
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {pillar.branch}
      </div>
    </div>
  );
}

function MajorLuckRow({ pillars }: { pillars: DisplayLuckPillar[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {pillars.map((pillar) => (
          <MajorLuckColumn key={`${pillar.startAge}-${pillar.pillar}`} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}

function ErrorPanel({ state }: { state: ChasamManselyeokPageState }) {
  return (
    <div
      style={{
        display: "flex",
        width: 900,
        flexDirection: "column",
        gap: 12,
        padding: 24,
        borderRadius: 18,
        border: "1px solid #dfc0c0",
        backgroundColor: "#fff5f5",
        color: "#7f3f3f",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        OG image failed
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 18,
        }}
      >
        {state.errors[0] ?? "Please check the input."}
      </div>
    </div>
  );
}

function SummaryLayout({ state }: { state: ChasamManselyeokPageState }) {
  const orderedPanels = getOrderedOgPanels(state);
  const bonwonMajorLuck = getBonwonMajorLuck(state);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 800,
        }}
      >
        <DayPillarRow panels={orderedPanels} />
      </div>
      <MajorLuckRow pillars={bonwonMajorLuck} />
    </div>
  );
}

export function PreviewImage({ state }: { state: ChasamManselyeokPageState }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4ede3",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 24,
          left: 24,
        }}
      >
        <BrandIcon />
      </div>
      {state.panels ? <SummaryLayout state={state} /> : <ErrorPanel state={state} />}
    </div>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const state = await getChasamManselyeokPageState(searchParams);

  return new ImageResponse(<PreviewImage state={state} />, {
    ...size,
  });
}
