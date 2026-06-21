"use client";

interface HistoryNavButtonProps {
  direction: "previous" | "next";
  onClick: () => void;
}

const floatingButtonClass =
  "relative z-10 flex h-16 w-16 sm:h-20 sm:w-20 touch-manipulation items-center justify-center rounded-full border border-stone-200/60 bg-white/70 text-stone-700 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all hover:bg-white/90 hover:text-stone-900 active:scale-95";

export function HistoryNavButton({ direction, onClick }: HistoryNavButtonProps) {
  const isPrevious = direction === "previous";
  const title = isPrevious ? "전날" : "다음날";

  return (
    <button
      aria-label={title}
      className={floatingButtonClass}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      title={title}
      type="button"
    >
      <span aria-hidden="true" suppressHydrationWarning className="flex items-center justify-center">
        {isPrevious ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        )}
      </span>
      <span className="sr-only">{title}</span>
    </button>
  );
}
