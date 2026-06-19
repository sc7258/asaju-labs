interface DisplaySettingsButtonProps {
  defaultShowDetails: boolean;
  defaultShowLuckDividers: boolean;
  defaultUseBoardBackground: boolean;
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] text-stone-800 transition hover:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]";

export function DisplaySettingsButton({
  defaultShowDetails,
  defaultShowLuckDividers,
  defaultUseBoardBackground,
}: DisplaySettingsButtonProps) {
  return (
    <details className="relative">
      <summary
        aria-label="표시 설정"
        className={`${iconButtonClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
        title="표시 설정"
      >
        <svg
          aria-hidden="true"
          className="h-[18px] w-[18px]"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M8.1 3.2h3.8l.48 1.66c.2.08.39.17.57.27l1.55-.76 2.7 2.7-.76 1.55c.1.18.19.37.27.57l1.66.48v3.8l-1.66.48c-.08.2-.17.39-.27.57l.76 1.55-2.7 2.7-1.55-.76a5.3 5.3 0 0 1-.57.27l-.48 1.66H8.1l-.48-1.66a5.3 5.3 0 0 1-.57-.27l-1.55.76-2.7-2.7.76-1.55a5.3 5.3 0 0 1-.27-.57l-1.66-.48v-3.8l1.66-.48c.08-.2.17-.39.27-.57l-.76-1.55 2.7-2.7 1.55.76c.18-.1.37-.19.57-.27L8.1 3.2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.15"
          />
          <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.15" />
        </svg>
        <span className="sr-only">표시 설정</span>
      </summary>

      <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[196px] rounded-md border border-[#b8afa4] bg-[#fffdf9] p-2 shadow-[0_12px_28px_rgba(64,49,27,0.14)]">
        <label className="flex cursor-pointer items-start gap-2 text-[12px] font-medium leading-4 text-stone-800">
          <input
            className="mt-[2px] h-3.5 w-3.5 rounded border-[#9c9388] text-stone-700"
            defaultChecked={defaultShowDetails}
            name="showDetails"
            type="checkbox"
            value="true"
          />
          <span>보조 정보 표시</span>
        </label>
        <p className="mt-1 pl-[22px] text-[10px] leading-4 text-[#8e8478]">
          기둥 위치, 적중 위치, 대운/세운 머리말
        </p>

        <label className="mt-2 flex cursor-pointer items-start gap-2 text-[12px] font-medium leading-4 text-stone-800">
          <input
            className="mt-[2px] h-3.5 w-3.5 rounded border-[#9c9388] text-stone-700"
            defaultChecked={defaultShowLuckDividers}
            name="showLuckDividers"
            type="checkbox"
            value="true"
          />
          <span>대운/세운 구분선</span>
        </label>

        <label className="mt-2 flex cursor-pointer items-start gap-2 text-[12px] font-medium leading-4 text-stone-800">
          <input
            className="mt-[2px] h-3.5 w-3.5 rounded border-[#9c9388] text-stone-700"
            defaultChecked={defaultUseBoardBackground}
            name="useBoardBackground"
            type="checkbox"
            value="true"
          />
          <span>사주판 배경색</span>
        </label>
      </div>
    </details>
  );
}
