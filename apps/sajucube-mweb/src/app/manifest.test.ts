import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { APP_NAME } from "@/lib/branding";
import { withPwaAssetVersion } from "@/lib/pwa-assets";

describe("manifest", () => {
  it("returns installable PWA metadata", () => {
    const result = manifest();

    expect(result.name).toBe(APP_NAME);
    expect(result.short_name).toBe(APP_NAME);
    expect(result.display).toBe("standalone");
    expect(result.start_url).toBe("/");
    expect(result.theme_color).toBe("#efe7da");
    expect(result.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: withPwaAssetVersion("/icon"),
          sizes: "512x512",
          purpose: "any",
        }),
        expect.objectContaining({
          src: withPwaAssetVersion("/icon"),
          sizes: "512x512",
          purpose: "maskable",
        }),
        expect.objectContaining({
          src: withPwaAssetVersion("/apple-icon"),
          sizes: "180x180",
        }),
      ]),
    );
  });
});
