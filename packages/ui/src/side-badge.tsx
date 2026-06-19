import React from "react";

export function SideBadge({
  label,
  value,
  hint,
  showDetails,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  showDetails: boolean;
  accent: "water" | "fire";
}) {
  const theme =
    accent === "water"
      ? "bg-[#eff7f5] text-[#9cb8c0] border-[#e7f0ee]"
      : "bg-[#f8f0f0] text-[#d49b87] border-[#eee1dc]";

  return (
    <div className="flex h-full flex-col justify-end gap-[2px] pb-[1px]">
      <div
        className={`flex aspect-square w-full min-w-0 items-center justify-center rounded-[5px] border px-1 text-[11px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[12px] ${theme}`}
      >
        {value || "-"}
      </div>
      <div className="flex min-h-[10px] items-center justify-center text-center text-[9px] font-semibold text-[#92a6b8]">
        {label}
      </div>
      {showDetails ? (
        <div className="flex min-h-[10px] items-center justify-center text-center text-[8px] leading-none text-[#b1ada7]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
