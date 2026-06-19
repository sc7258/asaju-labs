import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppVersionInfo } from "@/lib/app-version";

describe("getAppVersionInfo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("package.json 버전을 기준으로 앱 버전을 만든다", () => {
    const versionInfo = getAppVersionInfo();

    expect(versionInfo.version).toBe("0.1.2");
    expect(versionInfo.displayVersion.startsWith("0.1.2")).toBe(true);
  });

  it("배포 식별자가 있으면 짧은 빌드 id를 함께 만든다", () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "9509923abcdef1234567890");

    const versionInfo = getAppVersionInfo();

    expect(versionInfo.buildId).toBe("9509923abcde");
    expect(versionInfo.displayVersion).toBe("0.1.2+9509923abcde");
  });
});
