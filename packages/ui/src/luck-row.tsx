import Link from "next/link";
import { DisplayLuckPillar, DisplayYearLuck } from "@repo/saju-core";
import { elementTheme, getElementThemeKey } from "./theme";

function isPlainLeftClick(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) {
  return (
    event.button === 0 &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  );
}

export type LuckItemProps = (DisplayLuckPillar | DisplayYearLuck) & {
  marker: string;
  topLabel: string;
  isHighlighted: boolean;
  href?: string;
  onSelect?: () => void;
};

export function LuckRow({
  items,
  clickable,
}: {
  items: LuckItemProps[];
  clickable?: boolean;
}) {
  const highlightClass =
    "border-[#2f97d2] shadow-[0_0_0_2px_#7dc6ee] relative z-[1]";
  const highlightLabelClass = "text-[#3f95c7]";
  const highlightColumnClass =
    "bg-[#e3f5ff] ring-2 ring-[#7dc6ee] shadow-[inset_0_0_0_1px_#c8e9fb]";
  const highlightDotClass = "bg-[#5db2e0]";

  return (
    <div className="grid grid-cols-[repeat(10,26px)] justify-center gap-[2px] sm:grid-cols-[repeat(10,32px)] md:grid-cols-[repeat(10,36px)]">
      {items.map((item) => {
        const stemTheme = elementTheme[getElementThemeKey(item.stem)];
        const branchTheme = elementTheme[getElementThemeKey(item.branch)];

        return (
          <div key={item.marker}>
            {item.href && clickable ? (
              <Link
                className={`block space-y-[2px] rounded-[7px] px-[1px] py-[1px] ${
                  item.isHighlighted ? highlightColumnClass : ""
                }`}
                href={item.href}
                onClick={(event) => {
                  if (!item.onSelect || !isPlainLeftClick(event)) {
                    return;
                  }

                  event.preventDefault();
                  item.onSelect();
                }}
                prefetch={false}
                scroll={false}
              >
                <div className="flex h-1 items-center justify-center">
                  {item.isHighlighted ? (
                    <span
                      className={`block h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${highlightDotClass}`}
                    />
                  ) : null}
                </div>
                <div
                  className={`h-3 text-center text-[8px] font-semibold sm:h-4 sm:text-[9px] ${
                    item.isHighlighted ? highlightLabelClass : "text-[#98adc0]"
                  }`}
                >
                  {item.topLabel}
                </div>
                <div
                  className={`flex aspect-square w-full items-center justify-center rounded-[4px] border text-[15px] font-semibold sm:text-lg ${stemTheme.soft} ${
                    item.isHighlighted ? highlightClass : "border-[#8a8a8a]"
                  }`}
                >
                  {item.stem}
                </div>
                <div
                  className={`flex aspect-square w-full items-center justify-center rounded-[4px] border text-[15px] font-semibold sm:text-lg ${branchTheme.soft} ${
                    item.isHighlighted ? highlightClass : "border-[#8a8a8a]"
                  }`}
                >
                  {item.branch}
                </div>
              </Link>
            ) : (
              <div
                className={`space-y-[2px] rounded-[7px] px-[1px] py-[1px] ${
                  item.isHighlighted ? highlightColumnClass : ""
                }`}
              >
                <div className="flex h-1 items-center justify-center">
                  {item.isHighlighted ? (
                    <span
                      className={`block h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${highlightDotClass}`}
                    />
                  ) : null}
                </div>
                <div
                  className={`h-3 text-center text-[8px] font-semibold sm:h-4 sm:text-[9px] ${
                    item.isHighlighted ? highlightLabelClass : "text-[#98adc0]"
                  }`}
                >
                  {item.topLabel}
                </div>
                <div
                  className={`flex aspect-square w-full items-center justify-center rounded-[4px] border text-[15px] font-semibold sm:text-lg ${stemTheme.soft} ${
                    item.isHighlighted ? highlightClass : "border-[#8a8a8a]"
                  }`}
                >
                  {item.stem}
                </div>
                <div
                  className={`flex aspect-square w-full items-center justify-center rounded-[4px] border text-[15px] font-semibold sm:text-lg ${branchTheme.soft} ${
                    item.isHighlighted ? highlightClass : "border-[#8a8a8a]"
                  }`}
                >
                  {item.branch}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
