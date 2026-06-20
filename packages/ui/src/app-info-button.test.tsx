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

  it("팝오버 바깥을 누르면 닫힌다", () => {
    render(<AppInfoButton />);

    fireEvent.click(screen.getByLabelText("앱 정보"));
    expect(screen.getByRole("dialog", { name: "앱 정보" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("dialog", { name: "앱 정보" })).not.toBeInTheDocument();
  });

  it("Escape 키를 누르면 닫힌다", () => {
    render(<AppInfoButton />);

    fireEvent.click(screen.getByLabelText("앱 정보"));
    expect(screen.getByRole("dialog", { name: "앱 정보" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "앱 정보" })).not.toBeInTheDocument();
  });
});
