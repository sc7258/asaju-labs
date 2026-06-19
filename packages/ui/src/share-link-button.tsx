"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/branding";
import { DEFAULT_SITE_URL } from "@repo/saju-core";

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

function buildShareUrl(form: HTMLFormElement): string {
  const currentUrl = new URL(window.location.href);
  const actionUrl = new URL(form.action || currentUrl.toString(), currentUrl);
  const shareBaseUrl =
    isPrivateHostname(currentUrl.hostname) || isPrivateHostname(actionUrl.hostname)
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
      : actionUrl;
  const targetUrl = new URL(actionUrl.pathname, shareBaseUrl);
  const params = new URLSearchParams();

  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value !== "string") {
      continue;
    }

    params.append(key, value);
  }

  targetUrl.search = params.toString();

  return targetUrl.toString();
}

export function ShareLinkButton() {
  const router = useRouter();
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

    const nextHref = buildFormHref(form);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }

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
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] text-stone-800 transition hover:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]"
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
