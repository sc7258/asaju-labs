import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DisplaySettingsButton } from "./display-settings-button";

describe("DisplaySettingsButton", () => {
  it("defaults the helper display option to off", () => {
    render(
      <DisplaySettingsButton
        defaultShowDetails={false}
        defaultShowLuckDividers={false}
        defaultUseBoardBackground={false}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "보조 정보 표시" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "대운/세운 구분선" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "사주판 배경색" })).not.toBeChecked();
  });

  it("reflects the enabled state from the current URL params", () => {
    render(
      <DisplaySettingsButton
        defaultShowDetails
        defaultShowLuckDividers
        defaultUseBoardBackground
      />,
    );

    expect(screen.getByRole("checkbox", { name: "보조 정보 표시" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "대운/세운 구분선" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "사주판 배경색" })).toBeChecked();
  });
});
