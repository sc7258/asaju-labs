"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ManselyeokForm } from "@repo/ui/manselyeok-form";
import { ChasamManselyeokChartClient } from "@repo/ui/chasam-manselyeok-chart-client";
import { getChasamManselyeokPageState, type ChasamManselyeokPageState } from "@repo/saju-core";
import { shiftBirthTextByDays, type CalendarSelection } from "@/lib/date-navigation";
import { HistoryNavButton } from "@repo/ui/history-nav-button";

interface WorkspaceProps {
  initialState: ChasamManselyeokPageState;
}

export function ManselyeokWorkspace({ initialState }: WorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ChasamManselyeokPageState>(initialState);
  const [isPending, setIsPending] = useState(false);

  const currentParamsRecord = useMemo(() => {
    const record: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    
    const computeState = async () => {
      setIsPending(true);
      const newState = await getChasamManselyeokPageState(currentParamsRecord);
      if (active) {
        setState(newState);
        setIsPending(false);
      }
    };
    
    void computeState();
    
    return () => {
      active = false;
    };
  }, [currentParamsRecord]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const handleShiftDate = useCallback((direction: "previous" | "next") => {
    const calendarTypeRaw = currentParamsRecord.calendarType;
    const isLeapRaw = currentParamsRecord.isLeapMonth;
    const calendarSelection: CalendarSelection = 
      calendarTypeRaw === "solar" ? "solar" : 
      (isLeapRaw === "true" || calendarTypeRaw === "lunar-leap") ? "lunar-leap" : "lunar";
    
    const birthText = currentParamsRecord.birthText || state.input.birthText;

    const shifted = shiftBirthTextByDays({
      birthText,
      calendarSelection,
      dayDelta: direction === "previous" ? -1 : 1
    });

    if (shifted) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("birthText", shifted.birthText);
      nextParams.set("calendarType", shifted.calendarSelection);
      nextParams.delete("isLeapMonth");
      
      router.push(`?${nextParams.toString()}`, { scroll: false });
    }
  }, [currentParamsRecord, state.input.birthText, router, searchParams]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    if (e.changedTouches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;

    touchStartRef.current = null;

    const minDistance = 50;
    const maxTime = 400;
    
    if (Math.abs(deltaX) > minDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxTime) {
      handleShiftDate(deltaX > 0 ? "previous" : "next");
    }
  }, [handleShiftDate]);

  const chartKey = [
    state.input.gender,
    state.input.calendarType,
    state.input.isLeapMonth ? "leap" : "plain",
    state.input.birthText,
    state.input.showDetails ? "details" : "plain-details",
    state.input.showLuckDividers ? "dividers" : "plain-dividers",
    state.input.useBoardBackground ? "board-bg" : "plain-board-bg",
    state.panels?.map((panel) => panel.key).join(":") ?? "none",
  ].join(":");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 md:gap-3 relative">
      <ManselyeokForm input={state.input} errors={state.errors} />
      
      <div className="relative">
        {/* Floating Left Button */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 md:-left-10 pointer-events-none md:pointer-events-auto opacity-70 transition-opacity hover:opacity-100">
          <div className="pointer-events-auto">
            <HistoryNavButton direction="previous" onClick={() => handleShiftDate("previous")} />
          </div>
        </div>

        <div 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
          className={`transition-opacity duration-200 relative z-10 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          <ChasamManselyeokChartClient
            panels={state.panels}
            inputBirthText={state.input.birthText}
            key={chartKey}
          />
        </div>

        {/* Floating Right Button */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 md:-right-10 pointer-events-none md:pointer-events-auto opacity-70 transition-opacity hover:opacity-100">
          <div className="pointer-events-auto">
            <HistoryNavButton direction="next" onClick={() => handleShiftDate("next")} />
          </div>
        </div>
      </div>
    </div>
  );
}
