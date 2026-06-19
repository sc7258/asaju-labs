import type { Metadata } from "next";
import { ChasamManselyeokChartClient } from "@repo/ui/chasam-manselyeok-chart-client";
import { ManselyeokForm } from "@repo/ui/manselyeok-form";
import { APP_NAME } from "@/lib/branding";
import {
  getChasamManselyeokPageState,
  getManselyeokPageState,
  buildManselyeokShareDescription,
  buildOgImageUrl,
} from "@repo/saju-core";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: HomeProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  const state = await getManselyeokPageState(params);
  const imageUrl = buildOgImageUrl(params);
  const description = buildManselyeokShareDescription(state);

  return {
    title: APP_NAME,
    description,
    openGraph: {
      title: APP_NAME,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${APP_NAME} 만세력 미리보기`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const params = searchParams ? await searchParams : {};
  const state = await getChasamManselyeokPageState(params);
  const chartKey = [
    state.input.gender,
    state.input.calendarType,
    state.input.isLeapMonth ? "leap" : "plain",
    state.input.birthText,
    state.input.showDetails ? "details" : "plain-details",
    state.input.showLuckDividers ? "dividers" : "plain-dividers",
    state.input.useBoardBackground ? "board-bg" : "plain-board-bg",
    state.panels?.map((panel) => panel.key).join(":") ?? "none",
  ].join(":");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f2ece2_0%,#fbfaf7_34%,#efe8dc_100%)] px-2 py-2 text-stone-900 md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 md:gap-3">
        <ManselyeokForm input={state.input} errors={state.errors} />
        <ChasamManselyeokChartClient
          panels={state.panels}
          inputBirthText={state.input.birthText}
          key={chartKey}
        />
      </div>
    </main>
  );
}
