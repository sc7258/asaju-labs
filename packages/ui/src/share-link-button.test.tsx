import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildFormHref,
  buildShareUrl,
  isPrivateHostname,
  ShareLinkButton,
  syncBrowserUrl,
} from "./share-link-button";
import { APP_NAME } from "@/lib/branding";

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

  it("normalizes lunar leap selection into calendarType and isLeapMonth", () => {
    window.history.replaceState({}, "", "/manselyeok");

    const form = document.createElement("form");
    form.action = "http://localhost/manselyeok";

    const gender = document.createElement("input");
    gender.name = "gender";
    gender.value = "female";
    form.append(gender);

    const calendarType = document.createElement("input");
    calendarType.name = "calendarType";
    calendarType.value = "lunar-leap";
    form.append(calendarType);

    const birthText = document.createElement("input");
    birthText.name = "birthText";
    birthText.value = "197201261130";
    form.append(birthText);

    expect(buildFormHref(form)).toBe(
      "/manselyeok?gender=female&calendarType=lunar&isLeapMonth=true&birthText=197201261130",
    );
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

  it("includes the leap-month flag when the current form is lunar leap", () => {
    window.history.replaceState({}, "", "/manselyeok");

    const form = document.createElement("form");
    form.action = "http://localhost/manselyeok";

    const gender = document.createElement("input");
    gender.name = "gender";
    gender.value = "female";
    form.append(gender);

    const calendarType = document.createElement("input");
    calendarType.name = "calendarType";
    calendarType.value = "lunar-leap";
    form.append(calendarType);

    const birthText = document.createElement("input");
    birthText.name = "birthText";
    birthText.value = "197201261130";
    form.append(birthText);

    expect(buildShareUrl(form)).toBe(
      "https://sajucube.vercel.app/manselyeok?gender=female&calendarType=lunar&isLeapMonth=true&birthText=197201261130",
    );
  });
});

describe("syncBrowserUrl", () => {
  it("updates the address bar without using the router", () => {
    window.history.replaceState({}, "", "/manselyeok");

    syncBrowserUrl("/manselyeok?gender=male&calendarType=solar");

    expect(`${window.location.pathname}${window.location.search}`).toBe(
      "/manselyeok?gender=male&calendarType=solar",
    );
  });
});

describe("ShareLinkButton", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/manselyeok");
  });

  it("uses the branded app name for native share and syncs the browser URL", async () => {
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

    await user.click(screen.getByRole("button"));

    expect(`${window.location.pathname}${window.location.search}`).toBe(
      "/manselyeok?gender=male&calendarType=solar&birthText=19720126",
    );
    expect(share).toHaveBeenCalledWith({
      title: APP_NAME,
      url: "https://sajucube.vercel.app/manselyeok?gender=male&calendarType=solar&birthText=19720126",
    });
  });

  it("copies the current form URL when web share is unavailable", async () => {
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

    await user.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith(
      "https://sajucube.vercel.app/manselyeok?gender=female&calendarType=lunar&birthText=19720126",
    );
  });

  it("includes the display setting when it is enabled in the form", async () => {
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

    await user.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith(
      "https://sajucube.vercel.app/manselyeok?gender=female&calendarType=lunar&birthText=19720126&showDetails=true&showLuckDividers=true&useBoardBackground=true",
    );
  });
});
