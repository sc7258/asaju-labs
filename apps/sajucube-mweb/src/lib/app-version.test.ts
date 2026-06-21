import { afterEach, describe, expect, it, vi } from "vitest";
import packageJson from "../../package.json";
import { getAppVersionInfo } from "@/lib/app-version";

describe("getAppVersionInfo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the package.json version as the app version", () => {
    const versionInfo = getAppVersionInfo();

    expect(versionInfo.version).toBe(packageJson.version);
    expect(versionInfo.displayVersion.startsWith(packageJson.version)).toBe(true);
  });

  it("appends a shortened build id when deployment metadata exists", () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "9509923abcdef1234567890");

    const versionInfo = getAppVersionInfo();

    expect(versionInfo.buildId).toBe("9509923abcde");
    expect(versionInfo.displayVersion).toBe(`${packageJson.version}+9509923abcde`);
  });
});
