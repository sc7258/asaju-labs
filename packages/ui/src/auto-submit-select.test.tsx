import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoSubmitSelect } from "./auto-submit-select";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams("birthText=19720126"),
  usePathname: () => "/",
}));

describe("AutoSubmitSelect", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("keeps the existing router navigation by default", () => {
    render(
      <AutoSubmitSelect aria-label="calendar" defaultValue="solar" name="calendarType">
        <option value="solar">solar</option>
        <option value="lunar">lunar</option>
      </AutoSubmitSelect>,
    );

    fireEvent.change(screen.getByLabelText("calendar"), {
      target: { value: "lunar" },
    });

    expect(mockPush).toHaveBeenCalledWith("/?birthText=19720126&calendarType=lunar", {
      scroll: false,
    });
  });

  it("can update local state without touching the URL", () => {
    const onValueChange = vi.fn();

    render(
      <AutoSubmitSelect
        aria-label="gender"
        defaultValue="male"
        name="gender"
        onValueChange={onValueChange}
        syncUrl={false}
      >
        <option value="male">male</option>
        <option value="female">female</option>
      </AutoSubmitSelect>,
    );

    fireEvent.change(screen.getByLabelText("gender"), {
      target: { value: "female" },
    });

    expect(onValueChange).toHaveBeenCalledWith("female");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("keeps the select name on the actual DOM element for form serialization", () => {
    render(
      <AutoSubmitSelect aria-label="calendar" defaultValue="solar" name="calendarType">
        <option value="solar">solar</option>
        <option value="lunar">lunar</option>
      </AutoSubmitSelect>,
    );

    expect(screen.getByLabelText("calendar")).toHaveAttribute("name", "calendarType");
  });
});
