import { AppInfoButton } from "./app-info-button";
import { AutoSubmitSelect } from "./auto-submit-select";
import { BirthTextInput } from "./birth-text-input";
import { HistoryNavButton } from "./history-nav-button";
import { ShareLinkButton } from "./share-link-button";
import type { ManselyeokInput } from "@repo/saju-core";

interface ManselyeokFormProps {
  input: ManselyeokInput;
  errors: string[];
}

const controlClass =
  "h-9 rounded-md border border-[#a8a8a8] bg-white px-2 text-[12px] font-medium text-stone-900 outline-none transition focus:border-[#6f6f6f] sm:px-2.5 sm:text-sm";

const compactSelectClass =
  "h-9 w-9 shrink-0 appearance-none rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] px-0 text-center text-[13px] font-bold leading-none text-stone-800 outline-none transition focus:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]";

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#8d8d8d] bg-[linear-gradient(180deg,#ffffff_0%,#ececec_100%)] text-stone-800 transition hover:border-[#6f6f6f] hover:bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_100%)]";

export function ManselyeokForm({ input, errors }: ManselyeokFormProps) {
  const calendarSelection =
    input.calendarType === "solar"
      ? "solar"
      : input.isLeapMonth
        ? "lunar-leap"
        : "lunar";

  return (
    <section className="rounded-md border border-[#9a9a9a] bg-[#d5d5d5] p-1.5 sm:p-2">
      {errors.length > 0 ? (
        <div className="mb-2 rounded-md border border-[#d8a9a9] bg-[#fff3f3] px-2 py-1 text-[11px] leading-4 text-[#8a3f3f]">
          {errors.join(" / ")}
        </div>
      ) : null}

      <div>
        <form
          className="flex w-full items-center gap-0.5 whitespace-nowrap sm:gap-1.5"
          method="get"
        >
          <HistoryNavButton direction="previous" />

          <AutoSubmitSelect
            aria-label="성별"
            className={compactSelectClass}
            defaultValue={input.gender}
            name="gender"
          >
            <option value="male">남</option>
            <option value="female">여</option>
          </AutoSubmitSelect>

          <AutoSubmitSelect
            aria-label="달력 구분"
            className={compactSelectClass}
            defaultValue={calendarSelection}
            name="calendarType"
          >
            <option value="solar">양</option>
            <option value="lunar">음</option>
            <option value="lunar-leap">윤</option>
          </AutoSubmitSelect>

          <BirthTextInput
            className={`${controlClass} min-w-0 flex-1 px-1.5 text-[11px] tracking-tight tabular-nums sm:px-3 sm:text-[18px]`}
            defaultValue={input.birthText}
          />

          <button
            aria-label="만세력 생성"
            className={iconButtonClass}
            title="만세력 생성"
            type="submit"
          >
            <svg
              aria-hidden="true"
              className="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 2.75 11.48 7l4.27 1.52L11.48 10l-1.48 4.25L8.52 10 4.25 8.52 8.52 7 10 2.75Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.25"
              />
              <path
                d="M15.75 12.75 16.4 14.6l1.85.65-1.85.65-.65 1.85-.65-1.85-1.85-.65 1.85-.65.65-1.85Z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">만세력 생성</span>
          </button>

          <ShareLinkButton />
          <AppInfoButton />
          <HistoryNavButton direction="next" />
        </form>
      </div>
    </section>
  );
}
