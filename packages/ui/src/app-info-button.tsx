"use client";

import { useEffect, useRef, useState } from "react";
import { getAppVersionInfo } from "@/lib/app-version";
import { iconButtonClass } from "./manselyeok-form";

export function AppInfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const versionInfo = getAppVersionInfo();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-label="앱 정보"
        className={iconButtonClass}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        title="앱 정보"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-[18px] w-[18px]"
          fill="none"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M10 8v5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
          <circle cx="10" cy="5.8" r=".75" fill="currentColor" />
        </svg>
        <span className="sr-only">앱 정보</span>
      </button>

      {isOpen ? (
        <div
          aria-label="앱 정보"
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(220px,calc(100vw-24px))] rounded-2xl border border-white/50 bg-white/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          role="dialog"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-bold leading-5 text-stone-800">
              SajuCube 앱 정보
            </p>
            <button
              aria-label="앱 정보 닫기"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              onClick={() => {
                setIsOpen(false);
              }}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
          </div>

          <dl className="mt-3 space-y-2 text-[12px] leading-4 text-stone-600">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-stone-500">앱 버전</dt>
              <dd className="text-right font-medium tabular-nums text-stone-700">
                {versionInfo.version}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-stone-500">빌드</dt>
              <dd className="text-right font-medium tabular-nums text-stone-700">
                {versionInfo.buildId ?? "-"}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
