import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";
import { withPwaAssetVersion } from "@/lib/pwa-assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfaf7",
    theme_color: "#efe7da",
    lang: "ko-KR",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      {
        src: withPwaAssetVersion("/icon"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withPwaAssetVersion("/icon"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: withPwaAssetVersion("/apple-icon"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
