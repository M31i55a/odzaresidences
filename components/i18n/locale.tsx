"use client";

import { useSyncExternalStore } from "react";
import { DICTIONARIES, type Dict, type Locale } from "./dictionary";

const STORAGE_KEY = "odza-locale";

const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "fr";

/* Read at module load rather than in an effect. useSyncExternalStore compares
   the client snapshot against the server one and re-renders cleanly when they
   differ, so a returning French visitor doesn't get a hydration error — just a
   single corrective render. */
let current: Locale = "en";
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) current = saved;
  } catch {
    // private mode, storage disabled — English is a fine default
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => current;
const getServerSnapshot = (): Locale => "en";

export function setLocale(next: Locale) {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // preference just won't persist
  }
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The copy for the active language. */
export function useT(): Dict {
  return DICTIONARIES[useLocale()];
}
