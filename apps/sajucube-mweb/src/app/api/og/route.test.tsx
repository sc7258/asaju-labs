import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getBonwonMajorLuck,
  getOgDayPillar,
  getOrderedOgPanels,
  PreviewImage,
} from "@/app/api/og/route";
import { getChasamManselyeokPageState } from "@repo/saju-core-page";

describe("PreviewImage", () => {
  it("renders even when birth time is omitted", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "19810728",
    });

    const markup = renderToStaticMarkup(<PreviewImage state={state} />);

    expect(state.errors).toEqual([]);
    expect(markup).toContain("background-color:#f4ede3");
  });

  it("orders the six day pillars from buheoja to bonwon/charyeok to heoja", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    const orderedPanels = getOrderedOgPanels(state);

    expect(orderedPanels.map((panel) => panel.key)).toEqual([
      "buheoja-bonwon",
      "buheoja-charyeok",
      "bonwon",
      "charyeok",
      "heoja-bonwon",
      "heoja-charyeok",
    ]);
  });

  it("uses only the day pillar for each of the six OG cards", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    const dayPillars = getOrderedOgPanels(state).map((panel) =>
      getOgDayPillar(panel.viewModel.pillars),
    );

    expect(dayPillars).toHaveLength(6);
    expect(dayPillars.every((pillar) => pillar?.key === "day")).toBe(true);
  });

  it("uses bonwon major luck for the lower OG row", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    const bonwonMajorLuck = getBonwonMajorLuck(state);

    expect(bonwonMajorLuck).toHaveLength(10);
    expect(bonwonMajorLuck.map((item) => item.startAge)).toEqual([
      97, 87, 77, 67, 57, 47, 37, 27, 17, 7,
    ]);
  });

  it("does not render upper grouping labels or visible brand text", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    const markup = renderToStaticMarkup(<PreviewImage state={state} />);

    expect(markup).not.toContain("부허자 본차");
    expect(markup).not.toContain("허자 본차");
    expect(markup).not.toContain("부허자 본원");
    expect(markup).not.toContain("허자 차력");
    expect(markup).not.toContain(">SajuCube<");
  });

  it("keeps the brand icon while removing group dividers and age-label backgrounds", async () => {
    const state = await getChasamManselyeokPageState({
      name: "홍길동",
      gender: "male",
      calendarType: "solar",
      birthText: "197201261130",
    });

    const markup = renderToStaticMarkup(<PreviewImage state={state} />);

    expect(markup).toContain("aria-label=\"SajuCube icon\"");
    expect(markup).toContain("width:90px;height:90px");
    expect(markup).not.toContain("width:2px;height:212px;background-color:#d3c4b4");
    expect(markup).not.toContain("border-radius:999px");
    expect(markup).toContain("justify-content:space-between;width:800px");
  });
});
