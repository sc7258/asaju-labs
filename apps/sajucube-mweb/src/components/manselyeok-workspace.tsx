"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ManselyeokForm } from "@repo/ui/manselyeok-form";
import { ChasamManselyeokChartClient } from "@repo/ui/chasam-manselyeok-chart-client";
import {
  getChasamManselyeokPageState,
  setBirthTextDraft,
  type ChasamManselyeokPageState,
} from "@repo/saju-core";
import { shiftBirthTextByDays, type CalendarSelection } from "@/lib/date-navigation";
import { HistoryNavButton } from "@repo/ui/history-nav-button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface WorkspaceProps {
  initialState: ChasamManselyeokPageState;
  initialParamsRecord: Record<string, string>;
}

type ShiftDirection = "previous" | "next";

interface PanelEntry {
  paramsString: string;
  paramsRecord: Record<string, string>;
  pageState: ChasamManselyeokPageState;
}

interface CarouselSlots {
  previous: PanelEntry | null;
  current: PanelEntry;
  next: PanelEntry | null;
}

const SLIDE_ANIMATION_MS = 200;
const SWIPE_PREVIEW_THRESHOLD_PX = 12;

function buildParamsRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function buildParamsString(paramsRecord: Record<string, string>) {
  return new URLSearchParams(paramsRecord).toString();
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

function buildEntry(
  paramsString: string,
  paramsRecord: Record<string, string>,
  pageState: ChasamManselyeokPageState,
): PanelEntry {
  return {
    paramsString,
    paramsRecord,
    pageState,
  };
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

export function ManselyeokWorkspace({
  initialState,
  initialParamsRecord,
}: WorkspaceProps) {
  const initialParamsKey = useMemo(
    () => buildParamsString(initialParamsRecord),
    [initialParamsRecord],
  );
  const initialEntry = useMemo(() => {
    return buildEntry(initialParamsKey, initialParamsRecord, initialState);
  }, [initialParamsKey, initialParamsRecord, initialState]);

  const [slots, setSlots] = useState<CarouselSlots>({
    previous: null,
    current: initialEntry,
    next: null,
  });
  const [resolvedParamsKey, setResolvedParamsKey] = useState(initialParamsKey);
  const [isPending, setIsPending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const leftHintRef = useRef<HTMLDivElement | null>(null);
  const rightHintRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const scaleRef = useRef<number>(1);
  const dragOffsetRef = useRef(0);
  const dragFrameRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const slotRequestIdRef = useRef(0);
  const stateCacheRef = useRef(
    new Map<string, ChasamManselyeokPageState>([[initialParamsKey, initialState]]),
  );

  const clearDragFrame = useCallback(() => {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
  }, []);

  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const getViewportWidth = useCallback(() => {
    return viewportRef.current?.clientWidth ?? 360;
  }, []);

  const applyTrackFrame = useCallback((offset: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const width = getViewportWidth();
    const baseOffset = -width + offset;
    track.style.transform = `translate3d(${baseOffset}px, 0, 0)`;

    const progress = Math.min(Math.abs(offset) / width, 1);
    if (leftHintRef.current) {
      leftHintRef.current.style.opacity = offset > 0 ? String(progress) : "0";
    }
    if (rightHintRef.current) {
      rightHintRef.current.style.opacity = offset < 0 ? String(progress) : "0";
    }
  }, [getViewportWidth]);

  const scheduleTrackFrame = useCallback((offset: number) => {
    dragOffsetRef.current = offset;
    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      applyTrackFrame(dragOffsetRef.current);
    });
  }, [applyTrackFrame]);

  const setTrackTransitionEnabled = useCallback((enabled: boolean) => {
    if (!trackRef.current) {
      return;
    }

    trackRef.current.style.transitionProperty = enabled ? "transform" : "none";
    trackRef.current.style.transitionDuration = enabled ? `${SLIDE_ANIMATION_MS}ms` : "0ms";
    trackRef.current.style.transitionTimingFunction = "linear";
  }, []);

  const resetCarouselPosition = useCallback(() => {
    dragOffsetRef.current = 0;
    setTrackTransitionEnabled(false);
    applyTrackFrame(0);
    void trackRef.current?.offsetHeight;
    setTrackTransitionEnabled(!isDragging);
  }, [applyTrackFrame, isDragging, setTrackTransitionEnabled]);

  const loadPanelEntry = useCallback(async (paramsString: string, paramsRecord: Record<string, string>) => {
    const cachedState = stateCacheRef.current.get(paramsString);
    const pageState =
      cachedState ?? (await getChasamManselyeokPageState(paramsRecord));

    if (!cachedState) {
      stateCacheRef.current.set(paramsString, pageState);
    }

    return buildEntry(paramsString, paramsRecord, pageState);
  }, []);

  const buildShiftSeedFromEntry = useCallback((entry: PanelEntry, direction: ShiftDirection) => {
    const calendarSelection = getCalendarSelection(entry.paramsRecord);
    const birthText = entry.paramsRecord.birthText || entry.pageState.input.birthText;
    const shifted = shiftBirthTextByDays({
      birthText,
      calendarSelection,
      dayDelta: direction === "previous" ? -1 : 1,
    });

    if (!shifted) {
      return null;
    }

    const nextParams = new URLSearchParams(entry.paramsString);
    nextParams.set("birthText", shifted.birthText);
    nextParams.set("calendarType", shifted.calendarSelection);
    nextParams.delete("isLeapMonth");

    return {
      paramsString: nextParams.toString(),
      paramsRecord: buildParamsRecord(nextParams),
    };
  }, []);

  const loadNeighborEntry = useCallback(async (entry: PanelEntry, direction: ShiftDirection) => {
    const seed = buildShiftSeedFromEntry(entry, direction);
    if (!seed) {
      return null;
    }

    return loadPanelEntry(seed.paramsString, seed.paramsRecord);
  }, [buildShiftSeedFromEntry, loadPanelEntry]);

  const primeNeighbors = useCallback(async (entry: PanelEntry) => {
    const requestId = ++slotRequestIdRef.current;
    const [previous, next] = await Promise.all([
      loadNeighborEntry(entry, "previous"),
      loadNeighborEntry(entry, "next"),
    ]);

    if (slotRequestIdRef.current !== requestId) {
      return;
    }

    setSlots((current) => {
      if (current.current.paramsString !== entry.paramsString) {
        return current;
      }

      return {
        previous,
        current: entry,
        next,
      };
    });
  }, [loadNeighborEntry]);

  const updateCurrentEntry = useCallback(async (nextParamsRecord: Record<string, string>) => {
    const nextParamsString = buildParamsString(nextParamsRecord);
    if (nextParamsString === resolvedParamsKey) {
      return;
    }

    const requestId = ++slotRequestIdRef.current;
    clearAnimationTimeout();
    clearDragFrame();
    setIsDragging(false);
    setIsAnimating(false);
    dragOffsetRef.current = 0;
    setIsPending(true);

    const entry = await loadPanelEntry(nextParamsString, nextParamsRecord);

    if (slotRequestIdRef.current !== requestId) {
      return;
    }

    flushSync(() => {
      setSlots({
        previous: null,
        current: entry,
        next: null,
      });
      setResolvedParamsKey(nextParamsString);
      setIsPending(false);
    });

    resetCarouselPosition();
  }, [
    clearAnimationTimeout,
    clearDragFrame,
    loadPanelEntry,
    resetCarouselPosition,
    resolvedParamsKey,
  ]);

  const currentChartNode = useMemo(() => {
    return (
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        onTransformed={(ref, state) => {
          scaleRef.current = state.scale;
          setIsZoomed(state.scale > 1.1);
        }}
        onZoomStop={(ref) => {
          if (ref.state.scale < 1.15) {
            ref.resetTransform(150);
            setIsZoomed(false);
          }
        }}
        panning={{ disabled: !isZoomed }}
        doubleClick={{ disabled: true }}
        centerOnInit={true}
        centerZoomedOut={true}
      >
        <TransformComponent wrapperStyle={{ width: "100%", display: "flex", justifyContent: "center" }} contentStyle={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div className="w-full max-w-full">
            <ChasamManselyeokChartClient
              panels={slots.current.pageState.panels}
              inputBirthText={slots.current.pageState.input.birthText}
              key={getChartKey(slots.current.pageState)}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    );
  }, [slots.current, isZoomed]);

  const previousChartNode = useMemo(() => {
    if (!slots.previous) {
      return null;
    }

    return (
      <ChasamManselyeokChartClient
        panels={slots.previous.pageState.panels}
        inputBirthText={slots.previous.pageState.input.birthText}
        key={getChartKey(slots.previous.pageState)}
        useDraftSnapshot={false}
      />
    );
  }, [slots.previous]);

  const nextChartNode = useMemo(() => {
    if (!slots.next) {
      return null;
    }

    return (
      <ChasamManselyeokChartClient
        panels={slots.next.pageState.panels}
        inputBirthText={slots.next.pageState.input.birthText}
        key={getChartKey(slots.next.pageState)}
        useDraftSnapshot={false}
      />
    );
  }, [slots.next]);
  const canShiftPrevious = Boolean(slots.previous);
  const canShiftNext = Boolean(slots.next);

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
    setTrackTransitionEnabled(!isDragging);
  }, [isAnimating, isDragging, setTrackTransitionEnabled]);

  useLayoutEffect(() => {
    applyTrackFrame(dragOffsetRef.current);
  }, [applyTrackFrame, slots]);

  useEffect(() => {
    if (!isPending && resolvedParamsKey === slots.current.paramsString) {
      void primeNeighbors(slots.current);
    }
  }, [isPending, primeNeighbors, resolvedParamsKey, slots.current]);

  useEffect(() => {
    setBirthTextDraft(slots.current.pageState.input.birthText);
  }, [slots.current.pageState.input.birthText]);

  useEffect(() => {
    return () => {
      clearAnimationTimeout();
      clearDragFrame();
    };
  }, [clearAnimationTimeout, clearDragFrame]);

  const settleBackToCenter = useCallback(() => {
    setIsDragging(false);

    if (dragOffsetRef.current === 0) {
      return;
    }

    clearAnimationTimeout();
    clearDragFrame();

    if (prefersReducedMotion) {
      resetCarouselPosition();
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setTrackTransitionEnabled(true);
    scheduleTrackFrame(0);

    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      resetCarouselPosition();
    }, SLIDE_ANIMATION_MS);
  }, [
    clearAnimationTimeout,
    clearDragFrame,
    prefersReducedMotion,
    resetCarouselPosition,
    scheduleTrackFrame,
    setTrackTransitionEnabled,
  ]);

  const commitShift = useCallback((direction: ShiftDirection) => {
    if (isAnimating || isPending) {
      return;
    }

    if (direction === "previous" && !slots.previous) {
      return;
    }

    if (direction === "next" && !slots.next) {
      return;
    }

    if (
      document.activeElement instanceof HTMLElement &&
      (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
    ) {
      document.activeElement.blur();
    }

    const target = direction === "previous" ? slots.previous : slots.next;
    if (!target) {
      return;
    }

    const futurePromise =
      direction === "previous"
        ? loadNeighborEntry(target, "previous")
        : loadNeighborEntry(target, "next");

    const requestId = ++slotRequestIdRef.current;

    const finalizeShift = () => {
      dragOffsetRef.current = 0;

      flushSync(() => {
        setSlots({
          previous: direction === "previous" ? null : slots.current,
          current: target,
          next: direction === "previous" ? slots.current : null,
        });
        setResolvedParamsKey(target.paramsString);
        setIsAnimating(false);
      });

      resetCarouselPosition();
    };

    const attachFutureNeighbor = async () => {
      const futureNeighbor = await futurePromise;
      if (slotRequestIdRef.current !== requestId) {
        return;
      }

      setSlots((currentSlots) => {
        if (currentSlots.current.paramsString !== target.paramsString) {
          return currentSlots;
        }

        return {
          previous: direction === "previous" ? futureNeighbor : currentSlots.previous,
          current: currentSlots.current,
          next: direction === "previous" ? currentSlots.next : futureNeighbor,
        };
      });
    };

    if (prefersReducedMotion) {
      finalizeShift();
      void attachFutureNeighbor();
      return;
    }

    clearAnimationTimeout();
    clearDragFrame();
    setIsDragging(false);
    setIsAnimating(true);
    setTrackTransitionEnabled(true);

    scheduleTrackFrame(direction === "previous" ? getViewportWidth() : -getViewportWidth());

    animationTimeoutRef.current = window.setTimeout(async () => {
      finalizeShift();
      void attachFutureNeighbor();
    }, SLIDE_ANIMATION_MS);
  }, [
    clearAnimationTimeout,
    clearDragFrame,
    getViewportWidth,
    isAnimating,
    isPending,
    loadNeighborEntry,
    prefersReducedMotion,
    resetCarouselPosition,
    scheduleTrackFrame,
    setTrackTransitionEnabled,
    slots.current,
    slots.next,
    slots.previous,
  ]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (
      document.activeElement instanceof HTMLElement &&
      (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
    ) {
      document.activeElement.blur();
    }

    if (isAnimating || isPending || e.touches.length !== 1 || scaleRef.current > 1.05) {
      return;
    }

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, [isAnimating, isPending]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating || isPending || e.touches.length !== 1 || scaleRef.current > 1.05) {
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

    if (deltaX > 0 && !slots.previous) {
      return;
    }

    if (deltaX < 0 && !slots.next) {
      return;
    }

    if (!isDragging) {
      setIsDragging(true);
      setTrackTransitionEnabled(false);
    }

    const width = getViewportWidth();
    const clampedOffset = Math.max(-width, Math.min(width, deltaX));
    scheduleTrackFrame(clampedOffset);
  }, [
    getViewportWidth,
    isAnimating,
    isDragging,
    isPending,
    scheduleTrackFrame,
    setTrackTransitionEnabled,
    slots.next,
    slots.previous,
  ]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      return;
    }

    const touchStart = touchStartRef.current;
    touchStartRef.current = null;

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

  const handleGenderChange = useCallback((gender: string) => {
    const nextParamsRecord = {
      ...slots.current.paramsRecord,
      gender,
    };

    void updateCurrentEntry(nextParamsRecord);
  }, [slots.current.paramsRecord, updateCurrentEntry]);

  const handleCalendarSelectionChange = useCallback((calendarSelection: string) => {
    const nextParamsRecord = {
      ...slots.current.paramsRecord,
    };

    if (calendarSelection === "lunar-leap") {
      nextParamsRecord.calendarType = "lunar";
      nextParamsRecord.isLeapMonth = "true";
    } else {
      nextParamsRecord.calendarType = calendarSelection;
      delete nextParamsRecord.isLeapMonth;
    }

    void updateCurrentEntry(nextParamsRecord);
  }, [slots.current.paramsRecord, updateCurrentEntry]);

  const handleBirthTextSubmit = useCallback((birthText: string) => {
    const nextParamsRecord = {
      ...slots.current.paramsRecord,
      birthText,
    };

    void updateCurrentEntry(nextParamsRecord);
  }, [slots.current.paramsRecord, updateCurrentEntry]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 md:gap-3 relative">
      <div className="relative z-50">
        <ManselyeokForm
          input={slots.current.pageState.input}
          errors={slots.current.pageState.errors}
          onBirthTextSubmit={handleBirthTextSubmit}
          onCalendarSelectionChange={handleCalendarSelectionChange}
          onGenderChange={handleGenderChange}
          syncUrl={false}
        />
      </div>

      <div className="relative z-0">
        <div className="absolute left-0 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100 md:-left-10 md:translate-x-0">
          <div className={canShiftPrevious ? "" : "opacity-35"}>
            <HistoryNavButton direction="previous" onClick={() => void commitShift("previous")} />
          </div>
        </div>

        <div
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={settleBackToCenter}
          className={`relative z-0 overflow-x-hidden overflow-y-visible [touch-action:pan-y] ${isPending ? "opacity-70" : "opacity-100"}`}
        >
          <div
            ref={trackRef}
            className="flex w-[300%] will-change-transform"
            style={{
              transform: "translate3d(-33.333333%,0,0)",
            }}
          >
            <div className="w-1/3 flex-none pr-1.5">
              <div
                ref={leftHintRef}
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white/50 to-transparent opacity-0"
              />
              {previousChartNode}
            </div>
            <div className="relative w-1/3 flex-none px-0.5">
              {currentChartNode}
            </div>
            <div className="w-1/3 flex-none pl-1.5">
              <div
                ref={rightHintRef}
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/50 to-transparent opacity-0"
              />
              {nextChartNode}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 z-40 translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100 md:-right-10 md:translate-x-0">
          <div className={canShiftNext ? "" : "opacity-35"}>
            <HistoryNavButton direction="next" onClick={() => void commitShift("next")} />
          </div>
        </div>
      </div>
    </div>
  );
}
