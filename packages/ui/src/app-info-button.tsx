"use client";

import { useState } from "react";
import { getAppVersionInfo } from "@/lib/app-version";
import { iconButtonClass } from "./manselyeok-form";

export function AppInfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const versionInfo = getAppVersionInfo();

  return (
    <div className="relative shrink-0">
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
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] rounded-2xl border border-white/50 bg-white/90 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <p className="text-[13px] font-bold leading-5 text-stone-800">
            SajuCube 앱 정보
          </p>
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
