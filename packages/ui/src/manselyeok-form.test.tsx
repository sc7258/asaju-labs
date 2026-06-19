import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ManselyeokForm } from "./manselyeok-form";
import { DEFAULT_MANSELYEOK_INPUT } from "@repo/saju-core";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
    refresh: () => undefined,
  }),
}));

describe("ManselyeokForm", () => {
  it("표시 설정 버튼 없이 전날, 공유, 앱 정보, 다음날 버튼을 노출한다", () => {
    render(<ManselyeokForm errors={[]} input={DEFAULT_MANSELYEOK_INPUT} />);

    expect(screen.queryByLabelText("표시 설정")).not.toBeInTheDocument();
    expect(screen.getByLabelText("전날")).toBeInTheDocument();
    expect(screen.getByLabelText("공유")).toBeInTheDocument();
    expect(screen.getByLabelText("앱 정보")).toBeInTheDocument();
    expect(screen.getByLabelText("다음날")).toBeInTheDocument();
  });
});
