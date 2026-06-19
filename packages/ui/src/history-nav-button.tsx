"use client";

import { useRouter } from "next/navigation";
import {
  shiftBirthTextByDays,
  type CalendarSelection,
} from "@/lib/date-navigation";

interface HistoryNavButtonProps {
  direction: "previous" | "next";
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] text-stone-800 transition hover:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]";

function buildShiftedHref(
  form: HTMLFormElement,
  direction: "previous" | "next",
) {
  const currentUrl = new URL(window.location.href);
  const params = new URLSearchParams(currentUrl.search);
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") {
      continue;
    }

    params.set(key, value);
  }

  const rawCalendarSelection = formData.get("calendarType");
  const rawBirthText = formData.get("birthText");
  const calendarSelection: CalendarSelection =
    rawCalendarSelection === "lunar-leap"
      ? "lunar-leap"
      : rawCalendarSelection === "lunar"
        ? "lunar"
        : "solar";
  const shifted = shiftBirthTextByDays({
    birthText: typeof rawBirthText === "string" ? rawBirthText : "",
    calendarSelection,
    dayDelta: direction === "previous" ? -1 : 1,
  });

  if (!shifted) {
    return null;
  }

  params.set("birthText", shifted.birthText);
  params.set("calendarType", shifted.calendarSelection);
  params.delete("isLeapMonth");

  const search = params.toString();

  return `${currentUrl.pathname}${search ? `?${search}` : ""}${currentUrl.hash}`;
}

export function HistoryNavButton({ direction }: HistoryNavButtonProps) {
  const router = useRouter();
  const isPrevious = direction === "previous";
  const title = isPrevious ? "전날" : "다음날";

  return (
    <button
      aria-label={title}
      className={iconButtonClass}
      onClick={(event) => {
        const form = event.currentTarget.form;

        if (!form) {
          return;
        }

        const nextHref = buildShiftedHref(form, direction);

        if (!nextHref) {
          return;
        }

        router.push(nextHref, { scroll: false });
      }}
      title={title}
      type="button"
    >
      <span
        aria-hidden="true"
        className="text-[16px] font-semibold leading-none"
        suppressHydrationWarning
      >
        {isPrevious ? "<" : ">"}
      </span>
      <span className="sr-only">{title}</span>
    </button>
  );
}
