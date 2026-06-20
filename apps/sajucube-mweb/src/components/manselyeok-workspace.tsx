"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ManselyeokForm } from "@repo/ui/manselyeok-form";
import { ChasamManselyeokChartClient } from "@repo/ui/chasam-manselyeok-chart-client";
import { getChasamManselyeokPageState, type ChasamManselyeokPageState } from "@repo/saju-core";
import { shiftBirthTextByDays, type CalendarSelection } from "@/lib/date-navigation";
import { HistoryNavButton } from "@repo/ui/history-nav-button";

interface WorkspaceProps {
  initialState: ChasamManselyeokPageState;
}

type ShiftDirection = "previous" | "next";

interface PreparedShift {
  direction: ShiftDirection;
  paramsString: string;
  paramsRecord: Record<string, string>;
  nextState: ChasamManselyeokPageState;
}

const SLIDE_ANIMATION_MS = 280;
const SWIPE_PREVIEW_THRESHOLD_PX = 12;

function buildParamsRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function getCalendarSelection(
  currentParamsRecord: Record<string, string>,
): CalendarSelection {
  const calendarTypeRaw = currentParamsRecord.calendarType;
  const isLeapRaw = currentParamsRecord.isLeapMonth;

  if (calendarTypeRaw === "solar") {
    return "solar";
  }

  if (isLeapRaw === "true" || calendarTypeRaw === "lunar-leap") {
    return "lunar-leap";
  }

  return "lunar";
}

function getChartKey(state: ChasamManselyeokPageState) {
  return [
    state.input.gender,
    state.input.calendarType,
    state.input.isLeapMonth ? "leap" : "plain",
    state.input.birthText,
    state.input.showDetails ? "details" : "plain-details",
    state.input.showLuckDividers ? "dividers" : "plain-dividers",
    state.input.useBoardBackground ? "board-bg" : "plain-board-bg",
    state.panels?.map((panel) => panel.key).join(":") ?? "none",
  ].join(":");
}

function buildPreviewStyle(
  offset: number,
  progress: number,
) {
  return {
    transform: `translate3d(${offset}px, 0, 0) scale(${0.985 + progress * 0.015})`,
    opacity: 0.6 + progress * 0.4,
  };
}

function buildCurrentStyle(
  offset: number,
  hasPreview: boolean,
  isPending: boolean,
) {
  return {
    transform: `translate3d(${offset}px, 0, 0) scale(${hasPreview ? 0.992 : 1})`,
    opacity: isPending ? 0.7 : 1,
  };
}

export function ManselyeokWorkspace({ initialState }: WorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParamsKey = useMemo(() => searchParams.toString(), [searchParams]);
  const [state, setState] = useState<ChasamManselyeokPageState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [resolvedParamsKey, setResolvedParamsKey] = useState(currentParamsKey);
  const [previewShift, setPreviewShift] = useState<PreparedShift | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const currentLayerRef = useRef<HTMLDivElement | null>(null);
  const previewLayerRef = useRef<HTMLDivElement | null>(null);
  const leftHintRef = useRef<HTMLDivElement | null>(null);
  const rightHintRef = useRef<HTMLDivElement | null>(null);
  const stateCacheRef = useRef(
    new Map<string, ChasamManselyeokPageState>([[currentParamsKey, initialState]]),
  );
  const previewRequestIdRef = useRef(0);
  const animationTimeoutRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const dragDirectionRef = useRef<ShiftDirection | null>(null);
  const dragOffsetRef = useRef(0);

  const currentParamsRecord = useMemo(() => {
    return buildParamsRecord(searchParams);
  }, [searchParams]);
  const currentChartKey = useMemo(() => getChartKey(state), [state]);
  const currentChartNode = useMemo(() => {
    return (
      <ChasamManselyeokChartClient
        panels={state.panels}
        inputBirthText={state.input.birthText}
        key={currentChartKey}
      />
    );
  }, [currentChartKey, state.input.birthText, state.panels]);

  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const clearDragFrame = useCallback(() => {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
  }, []);

  const getViewportWidth = useCallback(() => {
    return viewportRef.current?.clientWidth ?? 360;
  }, []);

  const applyDragFrame = useCallback((offset: number) => {
    const width = getViewportWidth();
    const hasPreview = Boolean(previewShift);
    const progress = hasPreview ? Math.min(Math.abs(offset) / width, 1) : 0;

    if (currentLayerRef.current) {
      currentLayerRef.current.style.transform =
        buildCurrentStyle(offset, hasPreview, isPending).transform;
      currentLayerRef.current.style.opacity = String(
        buildCurrentStyle(offset, hasPreview, isPending).opacity,
      );
    }

    if (previewLayerRef.current && previewShift) {
      const baseOffset = previewShift.direction === "previous" ? -width : width;
      const previewStyle = buildPreviewStyle(baseOffset + offset, progress);
      previewLayerRef.current.style.transform = previewStyle.transform;
      previewLayerRef.current.style.opacity = String(previewStyle.opacity);
    }

    if (leftHintRef.current) {
      leftHintRef.current.style.opacity = hasPreview ? String(progress) : "0";
    }

    if (rightHintRef.current) {
      rightHintRef.current.style.opacity = hasPreview ? String(progress) : "0";
    }
  }, [getViewportWidth, isPending, previewShift]);

  const scheduleDragFrame = useCallback((offset: number) => {
    dragOffsetRef.current = offset;
    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      applyDragFrame(dragOffsetRef.current);
    });
  }, [applyDragFrame]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (currentParamsKey === resolvedParamsKey) {
      return;
    }

    let active = true;
    previewRequestIdRef.current += 1;
    dragDirectionRef.current = null;
    clearAnimationTimeout();
    clearDragFrame();
    setPreviewShift(null);
    setIsDragging(false);
    setIsAnimating(false);
    dragOffsetRef.current = 0;

    const cachedState = stateCacheRef.current.get(currentParamsKey);
    if (cachedState) {
      setState(cachedState);
      setResolvedParamsKey(currentParamsKey);
      setIsPending(false);
      applyDragFrame(0);
      return;
    }

    const computeState = async () => {
      setIsPending(true);
      const newState = await getChasamManselyeokPageState(currentParamsRecord);
      if (active) {
        stateCacheRef.current.set(currentParamsKey, newState);
        setState(newState);
        setResolvedParamsKey(currentParamsKey);
        setIsPending(false);
        dragOffsetRef.current = 0;
      }
    };

    void computeState();

    return () => {
      active = false;
    };
  }, [
    applyDragFrame,
    clearAnimationTimeout,
    clearDragFrame,
    currentParamsKey,
    currentParamsRecord,
    resolvedParamsKey,
  ]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating || isPending) {
      return;
    }

    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    dragDirectionRef.current = null;
  }, [isAnimating, isPending]);

  const buildShiftSeed = useCallback((direction: ShiftDirection) => {
    const calendarSelection = getCalendarSelection(currentParamsRecord);
    const birthText = currentParamsRecord.birthText || state.input.birthText;
    const shifted = shiftBirthTextByDays({
      birthText,
      calendarSelection,
      dayDelta: direction === "previous" ? -1 : 1,
    });

    if (!shifted) {
      return null;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("birthText", shifted.birthText);
    nextParams.set("calendarType", shifted.calendarSelection);
    nextParams.delete("isLeapMonth");

    return {
      direction,
      paramsString: nextParams.toString(),
      paramsRecord: buildParamsRecord(nextParams),
    };
  }, [currentParamsRecord, state.input.birthText, searchParams]);

  const warmShiftCache = useCallback(async (direction: ShiftDirection) => {
    const seed = buildShiftSeed(direction);
    if (!seed || stateCacheRef.current.has(seed.paramsString)) {
      return;
    }

    const nextState = await getChasamManselyeokPageState(seed.paramsRecord);
    stateCacheRef.current.set(seed.paramsString, nextState);
  }, [buildShiftSeed]);

  const ensurePreviewShift = useCallback(async (direction: ShiftDirection) => {
    const seed = buildShiftSeed(direction);
    if (!seed) {
      return null;
    }

    if (
      previewShift &&
      previewShift.direction === direction &&
      previewShift.paramsString === seed.paramsString
    ) {
      return previewShift;
    }

    const requestId = ++previewRequestIdRef.current;
    const cachedState = stateCacheRef.current.get(seed.paramsString);
    const nextState =
      cachedState ?? (await getChasamManselyeokPageState(seed.paramsRecord));

    if (!cachedState) {
      stateCacheRef.current.set(seed.paramsString, nextState);
    }

    const preparedShift = {
      ...seed,
      nextState,
    } satisfies PreparedShift;

    if (previewRequestIdRef.current === requestId) {
      setPreviewShift(preparedShift);
    }

    return preparedShift;
  }, [buildShiftSeed, previewShift]);

  const settleBackToCenter = useCallback(() => {
    previewRequestIdRef.current += 1;
    dragDirectionRef.current = null;
    setIsDragging(false);

    if (!previewShift && dragOffsetRef.current === 0) {
      return;
    }

    clearAnimationTimeout();
    clearDragFrame();

    if (prefersReducedMotion) {
      setPreviewShift(null);
      setIsAnimating(false);
      dragOffsetRef.current = 0;
      applyDragFrame(0);
      return;
    }

    setIsAnimating(true);
    scheduleDragFrame(0);

    animationTimeoutRef.current = window.setTimeout(() => {
      setPreviewShift(null);
      setIsAnimating(false);
      dragOffsetRef.current = 0;
    }, SLIDE_ANIMATION_MS);
  }, [
    applyDragFrame,
    clearAnimationTimeout,
    clearDragFrame,
    prefersReducedMotion,
    previewShift,
    scheduleDragFrame,
  ]);

  const commitShift = useCallback(async (direction: ShiftDirection) => {
    if (isAnimating || isPending) {
      return;
    }

    const preparedShift = await ensurePreviewShift(direction);
    if (!preparedShift) {
      return;
    }

    previewRequestIdRef.current += 1;
    dragDirectionRef.current = null;
    clearAnimationTimeout();
    clearDragFrame();
    setIsDragging(false);

    if (prefersReducedMotion) {
      setState(preparedShift.nextState);
      setResolvedParamsKey(preparedShift.paramsString);
      setPreviewShift(null);
      dragOffsetRef.current = 0;
      applyDragFrame(0);
      startTransition(() => {
        router.push(`?${preparedShift.paramsString}`, { scroll: false });
      });
      return;
    }

    setPreviewShift(preparedShift);
    setIsAnimating(true);

    requestAnimationFrame(() => {
      scheduleDragFrame(
        direction === "previous" ? getViewportWidth() : -getViewportWidth(),
      );
    });

    animationTimeoutRef.current = window.setTimeout(() => {
      setState(preparedShift.nextState);
      setResolvedParamsKey(preparedShift.paramsString);
      setPreviewShift(null);
      setIsAnimating(false);
      dragOffsetRef.current = 0;
      startTransition(() => {
        router.push(`?${preparedShift.paramsString}`, { scroll: false });
      });
    }, SLIDE_ANIMATION_MS);
  }, [
    applyDragFrame,
    clearAnimationTimeout,
    clearDragFrame,
    ensurePreviewShift,
    getViewportWidth,
    isAnimating,
    isPending,
    prefersReducedMotion,
    router,
    scheduleDragFrame,
  ]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating || isPending || e.touches.length !== 1) {
      return;
    }

    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    if (
      Math.abs(deltaX) < SWIPE_PREVIEW_THRESHOLD_PX ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.1
    ) {
      return;
    }

    const direction: ShiftDirection = deltaX > 0 ? "previous" : "next";
    const width = getViewportWidth();
    const clampedOffset = Math.max(-width, Math.min(width, deltaX));

    if (!isDragging) {
      setIsDragging(true);
    }
    scheduleDragFrame(clampedOffset);

    if (dragDirectionRef.current !== direction) {
      dragDirectionRef.current = direction;
      setPreviewShift((currentPreview) =>
        currentPreview?.direction === direction ? currentPreview : null,
      );
      void ensurePreviewShift(direction);
    }
  }, [ensurePreviewShift, getViewportWidth, isAnimating, isDragging, isPending, scheduleDragFrame]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchStart = touchStartRef.current;
    touchStartRef.current = null;
    dragDirectionRef.current = null;

    if (e.changedTouches.length !== 1) {
      settleBackToCenter();
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const width = getViewportWidth();
    const minCommitDistance = Math.max(56, width * 0.22);
    const hasHorizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
    const hasEnoughDistance = Math.abs(deltaX) > minCommitDistance;
    const isQuickSwipe =
      Math.abs(deltaX) > 72 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
      deltaTime < 240;

    if (hasHorizontalIntent && (hasEnoughDistance || isQuickSwipe)) {
      void commitShift(deltaX > 0 ? "previous" : "next");
      return;
    }

    settleBackToCenter();
  }, [commitShift, getViewportWidth, settleBackToCenter]);

  useEffect(() => {
    applyDragFrame(dragOffsetRef.current);
  }, [applyDragFrame, previewShift, isPending]);

  useEffect(() => {
    return () => {
      clearAnimationTimeout();
      clearDragFrame();
    };
  }, [clearAnimationTimeout, clearDragFrame]);

  useEffect(() => {
    const primeNeighbors = async () => {
      await Promise.all([
        warmShiftCache("previous"),
        warmShiftCache("next"),
      ]);
    };

    if (!isPending && resolvedParamsKey === currentParamsKey) {
      void primeNeighbors();
    }
  }, [currentParamsKey, isPending, resolvedParamsKey, warmShiftCache]);

  const previewChartKey = previewShift ? getChartKey(previewShift.nextState) : null;
  const previewChartNode = useMemo(() => {
    if (!previewShift) {
      return null;
    }

    return (
      <ChasamManselyeokChartClient
        panels={previewShift.nextState.panels}
        inputBirthText={previewShift.nextState.input.birthText}
        key={previewChartKey ?? "preview"}
      />
    );
  }, [previewChartKey, previewShift]);
  const viewportWidth = getViewportWidth();
  const renderedOffset = dragOffsetRef.current;
  const slideProgress = previewShift
    ? Math.min(Math.abs(renderedOffset) / viewportWidth, 1)
    : 0;
  const previewBaseOffset = previewShift
    ? previewShift.direction === "previous"
      ? -viewportWidth
      : viewportWidth
    : 0;
  const previewOffset = previewShift ? previewBaseOffset + renderedOffset : 0;
  const motionClass = isDragging
    ? "duration-0"
    : "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
  const previewStyle = previewShift
    ? buildPreviewStyle(previewOffset, slideProgress)
    : undefined;
  const currentStyle = buildCurrentStyle(renderedOffset, Boolean(previewShift), isPending);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 md:gap-3 relative">
      <ManselyeokForm input={state.input} errors={state.errors} />
      
      <div className="relative">
        {/* Floating Left Button */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 md:-left-10 pointer-events-none md:pointer-events-auto opacity-70 transition-opacity hover:opacity-100">
          <div className="pointer-events-auto">
            <HistoryNavButton direction="previous" onClick={() => void commitShift("previous")} />
          </div>
        </div>

        <div
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={settleBackToCenter}
          className={`relative z-10 overflow-hidden [touch-action:pan-y] ${isPending ? "opacity-70" : "opacity-100"}`}
        >
          <div className="grid">
            {previewShift ? (
              <div
                aria-hidden="true"
                ref={previewLayerRef}
                className={`pointer-events-none col-start-1 row-start-1 will-change-transform transition-[transform,opacity] ${motionClass}`}
                style={previewStyle}
              >
                {previewChartNode}
              </div>
            ) : null}

            <div
              ref={currentLayerRef}
              className={`col-start-1 row-start-1 relative will-change-transform transition-[transform,opacity] ${motionClass}`}
              style={currentStyle}
            >
              {previewShift ? (
                <>
                  <div
                    ref={leftHintRef}
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white/50 to-transparent"
                    style={{ opacity: slideProgress }}
                  />
                  <div
                    ref={rightHintRef}
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/50 to-transparent"
                    style={{ opacity: slideProgress }}
                  />
                </>
              ) : null}
              {currentChartNode}
            </div>
          </div>
        </div>

        {/* Floating Right Button */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 md:-right-10 pointer-events-none md:pointer-events-auto opacity-70 transition-opacity hover:opacity-100">
          <div className="pointer-events-auto">
            <HistoryNavButton direction="next" onClick={() => void commitShift("next")} />
          </div>
        </div>
      </div>
    </div>
  );
}
