import React from "react";

export function BirthSummary({
  profileLabel,
  solarSummaryLabel,
  lunarSummaryLabel,
}: {
  profileLabel: string;
  solarSummaryLabel: string;
  lunarSummaryLabel: string;
}) {
  function renderSummaryLabel(label: string, accent: "solar" | "lunar") {
    const isLeapLabel = label.startsWith("윤 ");

    if (!isLeapLabel) {
      return label;
    }

    const rest = label.slice(2);
    const badgeClass =
      accent === "solar"
        ? "border-[#7aa8da] bg-[#dcecff] text-[#1f4f86]"
        : "border-[#8d84d8] bg-[#e7e1ff] text-[#43308f]";

    return (
      <>
        <span
          className={`mr-[3px] inline-flex h-[11px] items-center rounded-[4px] border px-[3px] text-[7px] font-bold leading-none sm:h-3 sm:px-[4px] sm:text-[8px] ${badgeClass}`}
        >
          윤
        </span>
        <span>{rest}</span>
      </>
    );
  }

  return (
    <div className="flex min-h-[48px] flex-col justify-center px-[4px] py-[2px] text-[#6f675e] sm:min-h-[64px] sm:px-[5px] sm:py-[4px]">
      <div className="truncate text-[9px] font-semibold leading-none text-[#4e473f] sm:text-[10px]">
        {profileLabel}
      </div>
      <div className="mt-[2px] text-[8px] leading-none text-[#8f877d] sm:mt-[4px] sm:text-[9px]">
        {renderSummaryLabel(solarSummaryLabel, "solar")}
      </div>
      <div className="mt-[2px] text-[8px] leading-none text-[#9e958b] sm:mt-[3px] sm:text-[9px]">
        {renderSummaryLabel(lunarSummaryLabel, "lunar")}
      </div>
    </div>
  );
}
