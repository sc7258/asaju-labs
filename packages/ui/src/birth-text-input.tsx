"use client";

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  compactBirthText,
  formatBirthTextForDisplay,
} from "@repo/saju-core";
import { setBirthTextDraft } from "@repo/saju-core";

const AUTO_SUBMIT_DELAY_MS = 350;
const AUTO_SUBMIT_LENGTHS = new Set([8, 10, 12]);
const AUTO_SUBMIT_HISTORY_WINDOW_MS = 5000;
const AUTO_SUBMIT_TIMESTAMP_KEY = "sajucube:auto-submit-at";

function buildAutoSubmitHref(form: HTMLFormElement) {
  const currentUrl = new URL(window.location.href);
  const targetUrl = new URL(form.action || currentUrl.toString(), currentUrl);
  const params = new URLSearchParams();

  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value !== "string") {
      continue;
    }

    params.append(key, value);
  }

  targetUrl.search = params.toString();

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
}

export function resolveAutoSubmitNavigationMode(
  lastSubmittedAt: number | null,
  now: number,
) {
  if (lastSubmittedAt === null) {
    return "push" as const;
  }

  return now - lastSubmittedAt < AUTO_SUBMIT_HISTORY_WINDOW_MS
    ? ("replace" as const)
    : ("push" as const);
}

function getLastAutoSubmittedAt() {
  const stored = window.sessionStorage.getItem(AUTO_SUBMIT_TIMESTAMP_KEY);

  if (!stored) {
    return null;
  }

  const parsed = Number(stored);

  return Number.isFinite(parsed) ? parsed : null;
}

function markAutoSubmit(now: number) {
  window.sessionStorage.setItem(AUTO_SUBMIT_TIMESTAMP_KEY, String(now));
}

interface BirthTextInputProps {
  className: string;
  defaultValue: string;
}

type BirthTextAction =
  | { type: "type"; value: string }
  | { type: "sync"; value: string };

function birthTextReducer(_currentValue: string, action: BirthTextAction) {
  return action.value;
}

function isAutoSubmittableBirthText(rawValue: string) {
  return AUTO_SUBMIT_LENGTHS.has(rawValue.length);
}

export function countDigitsBeforeSelection(
  value: string,
  selectionStart: number | null,
) {
  const cursor = selectionStart ?? value.length;

  return value.slice(0, cursor).replace(/\D/g, "").length;
}

export function getSelectionFromRawIndex(
  value: string,
  rawIndex: number,
) {
  if (rawIndex <= 0) {
    return 0;
  }

  let digitCount = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? "")) {
      digitCount += 1;
    }

    if (digitCount >= rawIndex) {
      return index + 1;
    }
  }

  return value.length;
}

export function BirthTextInput({
  className,
  defaultValue,
}: BirthTextInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const pendingSelectionRawIndexRef = useRef<number | null>(null);
  const autoSubmitTimeoutRef = useRef<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, dispatchRawValue] = useReducer(
    birthTextReducer,
    defaultValue,
    compactBirthText,
  );
  const lastSubmittedValueRef = useRef(rawValue);
  const displayValue = formatBirthTextForDisplay(rawValue);

  const submitCurrentValue = useCallback((mode: "push" | "replace") => {
    const form = hiddenInputRef.current?.form;

    if (!form) {
      return;
    }

    const nextHref = buildAutoSubmitHref(form);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextHref === currentHref) {
      lastSubmittedValueRef.current = rawValue;
      return;
    }

    lastSubmittedValueRef.current = rawValue;
    markAutoSubmit(Date.now());

    if (mode === "replace") {
      router.replace(nextHref, { scroll: false });
      return;
    }

    router.push(nextHref, { scroll: false });
  }, [rawValue, router]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const pendingSelectionRawIndex = pendingSelectionRawIndexRef.current;

    if (!input || pendingSelectionRawIndex === null) {
      return;
    }

    const nextSelection = getSelectionFromRawIndex(
      input.value,
      pendingSelectionRawIndex,
    );

    input.setSelectionRange(nextSelection, nextSelection);
    pendingSelectionRawIndexRef.current = null;
  }, [displayValue]);

  useEffect(() => {
    setBirthTextDraft(rawValue);
  }, [rawValue]);

  useEffect(() => {
    const nextDefaultValue = compactBirthText(defaultValue);

    if (nextDefaultValue === rawValue) {
      lastSubmittedValueRef.current = nextDefaultValue;
      return;
    }

    if (isFocused) {
      return;
    }

    dispatchRawValue({ type: "sync", value: nextDefaultValue });
    lastSubmittedValueRef.current = nextDefaultValue;
  }, [defaultValue, isFocused, rawValue]);

  useEffect(() => {
    if (
      !isAutoSubmittableBirthText(rawValue) ||
      rawValue === lastSubmittedValueRef.current
    ) {
      return;
    }

    autoSubmitTimeoutRef.current = window.setTimeout(() => {
      const submittedAt = Date.now();
      const navigationMode = resolveAutoSubmitNavigationMode(
        getLastAutoSubmittedAt(),
        submittedAt,
      );
      submitCurrentValue(navigationMode);
    }, AUTO_SUBMIT_DELAY_MS);

    return () => {
      if (autoSubmitTimeoutRef.current !== null) {
        window.clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = null;
      }
    };
  }, [rawValue, submitCurrentValue]);

  return (
    <>
      <input
        autoComplete="off"
        aria-label="생년월일시"
        className={className}
        inputMode="numeric"
        onBlur={() => {
          setIsFocused(false);
        }}
        onChange={(event) => {
          const nextRawValue = compactBirthText(event.target.value);
          pendingSelectionRawIndexRef.current = countDigitsBeforeSelection(
            event.target.value,
            event.target.selectionStart,
          );

          dispatchRawValue({ type: "type", value: nextRawValue });
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        placeholder="1972 0126 1200"
        ref={inputRef}
        spellCheck={false}
        type="text"
        value={displayValue}
      />
      <input name="birthText" ref={hiddenInputRef} type="hidden" value={rawValue} />
    </>
  );
}
