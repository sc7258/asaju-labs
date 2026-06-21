import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";
import { Suspense } from "react";
import {
  getChasamManselyeokPageState,
  getManselyeokPageState,
  buildManselyeokShareDescription,
  buildOgImageUrl,
  flattenSearchParams,
} from "@repo/saju-core";
import { ManselyeokWorkspace } from "@/components/manselyeok-workspace";

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
  const initialParamsRecord = flattenSearchParams(params);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f2ece2_0%,#fbfaf7_34%,#efe8dc_100%)] px-2 py-2 text-stone-900 md:px-5 md:py-6 relative z-0">
      <Suspense fallback={<div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 md:gap-3 opacity-50" />}>
        <ManselyeokWorkspace
          initialParamsRecord={initialParamsRecord}
          initialState={state}
        />
      </Suspense>
    </main>
  );
}
