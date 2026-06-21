"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/branding";
import { DEFAULT_SITE_URL } from "@repo/saju-core";
import { iconButtonClass } from "./manselyeok-form";

type ShareStatus = "idle" | "shared" | "copied" | "error";

function isPrivateHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local") ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export function buildFormHref(form: HTMLFormElement): string {
  const currentUrl = new URL(window.location.href);
  const actionUrl = new URL(form.action || currentUrl.toString(), currentUrl);
  const targetUrl = new URL(actionUrl.pathname, currentUrl);
  const params = buildFormSearchParams(form);

  targetUrl.search = params.toString();

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
}

function buildFormSearchParams(form: HTMLFormElement) {
  const params = new URLSearchParams();

  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value !== "string") {
      continue;
    }

    if (key === "calendarType" && value === "lunar-leap") {
      params.set("calendarType", "lunar");
      params.set("isLeapMonth", "true");
      continue;
    }

    params.set(key, value);
  }

  return params;
}

export function syncBrowserUrl(href: string) {
  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (href === currentHref) {
    return;
  }

  window.history.replaceState(window.history.state, "", href);
}

function buildShareUrl(form: HTMLFormElement): string {
  const currentUrl = new URL(window.location.href);
  const actionUrl = new URL(form.action || currentUrl.toString(), currentUrl);
  const shareBaseUrl =
    isPrivateHostname(currentUrl.hostname) || isPrivateHostname(actionUrl.hostname)
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
      : actionUrl;
  const targetUrl = new URL(actionUrl.pathname, shareBaseUrl);
  const params = buildFormSearchParams(form);

  targetUrl.search = params.toString();

  return targetUrl.toString();
}

export function ShareLinkButton() {
  const [status, setStatus] = useState<ShareStatus>("idle");

  useEffect(() => {
    if (status === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatus("idle");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    if (!form) {
      setStatus("error");
      return;
    }

    const birthTextFormData = form.elements.namedItem("birthText");
    const rawBirthText =
      birthTextFormData instanceof HTMLInputElement
        ? birthTextFormData.value
        : "";
    const digitCount = rawBirthText.replace(/\D/g, "").length;

    if (digitCount < 8) {
      window.alert("생년월일 8자리가 모두 입력되어야 결과를 공유할 수 있습니다.");
      return;
    }

    const nextHref = buildFormHref(form);
    syncBrowserUrl(nextHref);

    const url = buildShareUrl(form);

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: APP_NAME,
          url,
        });
        setStatus("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
        return;
      }

      setStatus("error");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatus("error");
    }
  }

  const title =
    status === "shared"
      ? "공유 완료"
      : status === "copied"
        ? "링크 복사됨"
        : status === "error"
          ? "공유 실패"
          : "공유";

  return (
    <button
      aria-label={title}
      className={iconButtonClass}
      onClick={handleClick}
      title={title}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        viewBox="0 0 20 20"
      >
        <circle cx="5" cy="10" r="1.7" fill="currentColor" />
        <circle cx="14.5" cy="5" r="1.7" fill="currentColor" />
        <circle cx="14.5" cy="15" r="1.7" fill="currentColor" />
        <path
          d="M6.6 9.2 12.85 5.8M6.6 10.8l6.25 3.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.25"
        />
      </svg>
      <span aria-live="polite" className="sr-only">
        {title}
      </span>
    </button>
  );
}

export { buildShareUrl, isPrivateHostname };
