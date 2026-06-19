import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";
import { withPwaAssetVersion } from "@/lib/pwa-assets";

describe("layout metadata", () => {
  it("uses a versioned manifest URL for install metadata refreshes", () => {
    expect(metadata.manifest).toBe(withPwaAssetVersion("/manifest.webmanifest"));
  });
});
