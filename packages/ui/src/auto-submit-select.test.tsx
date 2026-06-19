import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutoSubmitSelect } from "./auto-submit-select";

describe("AutoSubmitSelect", () => {
  it("값이 바뀌면 폼을 바로 제출한다", () => {
    const requestSubmit = vi.fn();

    render(
      <form
        ref={(node) => {
          if (node) {
            node.requestSubmit = requestSubmit;
          }
        }}
      >
        <AutoSubmitSelect aria-label="달력 구분" defaultValue="solar" name="calendarType">
          <option value="solar">양</option>
          <option value="lunar">음</option>
        </AutoSubmitSelect>
      </form>,
    );

    fireEvent.change(screen.getByLabelText("달력 구분"), {
      target: { value: "lunar" },
    });

    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });
});
