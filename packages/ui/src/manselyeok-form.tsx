import { AppInfoButton } from "./app-info-button";
import { AutoSubmitSelect } from "./auto-submit-select";
import { BirthTextInput } from "./birth-text-input";
import { ShareLinkButton } from "./share-link-button";
import type { ManselyeokInput } from "@repo/saju-core";

interface ManselyeokFormProps {
  input: ManselyeokInput;
  errors: string[];
  onBirthTextSubmit?: (birthText: string) => void;
  onCalendarSelectionChange?: (calendarSelection: string) => void;
  onGenderChange?: (gender: string) => void;
  syncUrl?: boolean;
}

export const controlClass =
  "h-11 rounded-2xl border border-white/40 bg-white/70 px-3 text-[14px] font-medium text-stone-700 outline-none transition focus:border-stone-300 focus:bg-white focus:ring-2 focus:ring-stone-100 sm:px-4 sm:text-base placeholder:text-stone-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]";

export const compactSelectClass =
  "h-11 w-11 shrink-0 appearance-none rounded-2xl border border-white/40 bg-white/60 px-0 text-center text-[14px] font-medium leading-none text-stone-600 outline-none transition hover:bg-white/80 focus:border-stone-300 focus:bg-white focus:ring-2 focus:ring-stone-100 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]";

export const iconButtonClass =
  "relative z-10 inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/40 bg-white/60 text-stone-500 transition hover:bg-white/80 hover:text-stone-700 focus:bg-white focus:ring-2 focus:ring-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]";

export function ManselyeokForm({
  input,
  errors,
  onBirthTextSubmit,
  onCalendarSelectionChange,
  onGenderChange,
  syncUrl = true,
}: ManselyeokFormProps) {
  const calendarSelection =
    input.calendarType === "solar"
      ? "solar"
      : input.isLeapMonth
        ? "lunar-leap"
        : "lunar";

  return (
    <section className="relative z-50 isolate rounded-3xl border border-white/50 bg-white/40 p-2 sm:p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
      {errors.length > 0 ? (
        <div className="mb-2 rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2 text-[12px] font-medium leading-4 text-red-600 backdrop-blur-sm">
          {errors.join(" / ")}
        </div>
      ) : null}

      <div>
        <form
          className="flex w-full items-center gap-1 whitespace-nowrap sm:gap-2"
          method="get"
          onSubmit={(e) => e.preventDefault()}
        >
          <AutoSubmitSelect
            aria-label="성별"
            className={compactSelectClass}
            defaultValue={input.gender}
            name="gender"
            onValueChange={onGenderChange}
            syncUrl={syncUrl}
          >
            <option value="male">남</option>
            <option value="female">여</option>
          </AutoSubmitSelect>

          <AutoSubmitSelect
            aria-label="달력 구분"
            className={compactSelectClass}
            defaultValue={calendarSelection}
            name="calendarType"
            onValueChange={onCalendarSelectionChange}
            syncUrl={syncUrl}
          >
            <option value="solar">양</option>
            <option value="lunar">음</option>
            <option value="lunar-leap">윤</option>
          </AutoSubmitSelect>

          <BirthTextInput
            className={`${controlClass} min-w-0 flex-1 tabular-nums`}
            defaultValue={input.birthText}
            onSubmitValue={onBirthTextSubmit}
            syncUrl={syncUrl}
          />

          <ShareLinkButton />
          <AppInfoButton />
        </form>
      </div>
    </section>
  );
}
