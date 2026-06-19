import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildFormHref,
  buildShareUrl,
  isPrivateHostname,
  ShareLinkButton,
} from "./share-link-button";
import { APP_NAME } from "@/lib/branding";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: () => undefined,
    replace: mockReplace,
    refresh: () => undefined,
  }),
}));

describe("isPrivateHostname", () => {
  it("detects localhost and private network hostnames", () => {
    expect(isPrivateHostname("localhost")).toBe(true);
    expect(isPrivateHostname("192.168.0.12")).toBe(true);
    expect(isPrivateHostname("10.0.0.5")).toBe(true);
    expect(isPrivateHostname("sajucube.vercel.app")).toBe(false);
  });
});

describe("buildFormHref", () => {
  it("builds the current form href with the latest fields", () => {
    window.history.replaceState({}, "", "/manselyeok");

    const form = document.createElement("form");
    form.action = "http://localhost/manselyeok";

    const gender = document.createElement("input");
    gender.name = "gender";
    gender.value = "male";
    form.append(gender);

    const calendarType = document.createElement("input");
    calendarType.name = "calendarType";
    calendarType.value = "solar";
    form.append(calendarType);

    expect(buildFormHref(form)).toBe("/manselyeok?gender=male&calendarType=solar");
  });
});

describe("buildShareUrl", () => {
  it("uses the public site URL when the current page is localhost", () => {
    window.history.replaceState({}, "", "/manselyeok");

    const form = document.createElement("form");
    form.action = "http://localhost/manselyeok";

    const gender = document.createElement("input");
    gender.name = "gender";
    gender.value = "male";
    form.append(gender);

    const calendarType = document.createElement("input");
    calendarType.name = "calendarType";
    calendarType.value = "solar";
    form.append(calendarType);

    const birthText = document.createElement("input");
    birthText.name = "birthText";
    birthText.value = "197201261130";
    form.append(birthText);

    expect(buildShareUrl(form)).toBe(
      "https://sajucube.vercel.app/manselyeok?gender=male&calendarType=solar&birthText=197201261130",
    );
  });
});

describe("ShareLinkButton", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it("uses the branded app name for native share", async () => {
    window.history.replaceState({}, "", "/manselyeok");

    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    render(
      <form action="http://localhost/manselyeok">
        <input name="gender" readOnly value="male" />
        <input name="calendarType" readOnly value="solar" />
        <input name="birthText" readOnly value="19720126" />
        <ShareLinkButton />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "공유" }));

    expect(mockReplace).toHaveBeenCalledWith(
      "/manselyeok?gender=male&calendarType=solar&birthText=19720126",
      { scroll: false },
    );
    expect(share).toHaveBeenCalledWith({
      title: APP_NAME,
      url: "https://sajucube.vercel.app/manselyeok?gender=male&calendarType=solar&birthText=19720126",
    });
  });

  it("copies the current form URL when web share is unavailable", async () => {
    window.history.replaceState({}, "", "/manselyeok");

    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(
      <form action="http://localhost/manselyeok">
        <input name="gender" readOnly value="female" />
        <input name="calendarType" readOnly value="lunar" />
        <input name="birthText" readOnly value="19720126" />
        <ShareLinkButton />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "공유" }));

    expect(writeText).toHaveBeenCalledWith(
      "https://sajucube.vercel.app/manselyeok?gender=female&calendarType=lunar&birthText=19720126",
    );
    expect(
      screen.getByRole("button", { name: "링크 복사됨" }),
    ).toBeInTheDocument();
  });

  it("includes the display setting when it is enabled in the form", async () => {
    window.history.replaceState({}, "", "/manselyeok");

    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(
      <form action="http://localhost/manselyeok">
        <input name="gender" readOnly value="female" />
        <input name="calendarType" readOnly value="lunar" />
        <input name="birthText" readOnly value="19720126" />
        <input name="showDetails" readOnly value="true" />
        <input name="showLuckDividers" readOnly value="true" />
        <input name="useBoardBackground" readOnly value="true" />
        <ShareLinkButton />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "공유" }));

    expect(writeText).toHaveBeenCalledWith(
      "https://sajucube.vercel.app/manselyeok?gender=female&calendarType=lunar&birthText=19720126&showDetails=true&showLuckDividers=true&useBoardBackground=true",
    );
  });
});
