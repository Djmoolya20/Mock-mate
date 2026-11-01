"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { getHistory, STORAGE_KEYS, subscribeStorage } from "./store";
import type { Report, UserProfile } from "./types";

export function useStorageValue(
  key: string,
  area: "local" | "session" = "local",
): string | null | undefined {
  const subscribe = useCallback(
    (callback: () => void) =>
      area === "local" ? subscribeStorage(key, callback) : () => undefined,
    [area, key],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return area === "session"
        ? window.sessionStorage.getItem(key)
        : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [area, key]);

  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

export function parseStoredJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useStoredUser(): UserProfile | null {
  const raw = useStorageValue(STORAGE_KEYS.user);
  return useMemo(() => parseStoredJson<UserProfile | null>(raw, null), [raw]);
}

export function useStoredHistory(): {
  raw: string | null | undefined;
  reports: Report[] | null;
} {
  const raw = useStorageValue(STORAGE_KEYS.history);

  useEffect(() => {
    if (raw === null) {
      getHistory();
    }
  }, [raw]);

  const reports = useMemo(() => {
    if (raw === undefined || raw === null) return null;
    const parsed = parseStoredJson<Report[]>(raw, []);
    return [...parsed].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [raw]);

  return { raw, reports };
}

export function useLastConfigRaw(): string | null | undefined {
  return useStorageValue(STORAGE_KEYS.lastConfig);
}
