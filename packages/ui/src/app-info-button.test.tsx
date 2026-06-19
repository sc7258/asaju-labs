import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppInfoButton } from "./app-info-button";
import { getAppVersionInfo } from "@/lib/app-version";

describe("AppInfoButton", () => {
  it("앱 정보 버튼 클릭 시 버전 정보를 보여준다", () => {
    const versionInfo = getAppVersionInfo();

    render(<AppInfoButton />);

    fireEvent.click(screen.getByLabelText("앱 정보"));

    expect(screen.getByText("SajuCube 앱 정보")).toBeInTheDocument();
    expect(screen.getByText("앱 버전")).toBeInTheDocument();
    expect(screen.getByText(versionInfo.version)).toBeInTheDocument();
    expect(screen.getByText("빌드")).toBeInTheDocument();
  });
});
