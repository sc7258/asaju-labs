"use client";

import { useSyncExternalStore } from "react";
import { compactBirthText } from "./birth-text";

type Listener = () => void;

const listeners = new Set<Listener>();

let currentBirthTextDraft = "";

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getBirthTextDraft() {
  return currentBirthTextDraft;
}

export function setBirthTextDraft(nextBirthText: string) {
  const compactValue = compactBirthText(nextBirthText);

  if (compactValue === currentBirthTextDraft) {
    return;
  }

  currentBirthTextDraft = compactValue;
  emitChange();
}

export function resetBirthTextDraft() {
  currentBirthTextDraft = "";
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useBirthTextDraft(fallbackBirthText = "") {
  const fallbackValue = compactBirthText(fallbackBirthText);
  const draftBirthText = useSyncExternalStore(
    subscribe,
    getBirthTextDraft,
    () => fallbackValue,
  );

  return draftBirthText || fallbackValue;
}
