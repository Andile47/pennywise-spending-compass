import { useEffect, useState, useSyncExternalStore } from "react";
import type { UIMessage } from "ai";
import type { Profile, Transaction } from "./types";

export interface PennyState {
  profile: Profile;
  transactions: Transaction[];
  chat: UIMessage[];
}

const KEY = "pennywise:v1";
const DEFAULT: PennyState = {
  profile: { onboarded: false, level: "Beginner", goal: "budget", currency: "ZAR" },
  transactions: [],
  chat: [],
};

let state: PennyState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    state = DEFAULT;
  }
}

export function getState() {
  load();
  return state;
}

export function setState(update: (s: PennyState) => PennyState) {
  load();
  state = update(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

export function resetAll() {
  setState(() => DEFAULT);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePenny<T>(select: (s: PennyState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getState()),
    () => select(DEFAULT),
  );
}

/** True after the browser has loaded stored data. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
