"use client";

import { useState } from "react";
import { getAppVersionInfo } from "@/lib/app-version";

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] text-stone-800 transition hover:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]";

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
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[196px] rounded-md border border-[#b8afa4] bg-[#fffdf9] p-2 shadow-[0_12px_28px_rgba(64,49,27,0.14)]">
          <p className="text-[12px] font-semibold leading-4 text-stone-900">
            SajuCube 앱 정보
          </p>
          <dl className="mt-2 space-y-2 text-[11px] leading-4 text-stone-800">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#8e8478]">앱 버전</dt>
              <dd className="text-right font-medium tabular-nums">
                {versionInfo.version}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#8e8478]">빌드</dt>
              <dd className="text-right font-medium tabular-nums">
                {versionInfo.buildId ?? "-"}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
