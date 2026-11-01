import { createSampleReports } from "./interview";
import type { InterviewConfig, InterviewSession, Report, UserProfile } from "./types";

const HISTORY_KEY = "poise.history.v1";
const DRAFT_KEY = "poise.draft.v1";
const LAST_CONFIG_KEY = "poise.last-config.v1";
const USER_KEY = "poise.user.v1";

export const STORAGE_KEYS = {
  history: HISTORY_KEY,
  draft: DRAFT_KEY,
  lastConfig: LAST_CONFIG_KEY,
  user: USER_KEY,
} as const;

export const STORAGE_EVENT = "poise:storage-change";

function notifyStorage(key: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, { detail: { key } }),
  );
}

export function subscribeStorage(
  key: string,
  callback: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (event.key !== key) return;
    } else if (event instanceof CustomEvent) {
      if ((event.detail as { key?: string } | undefined)?.key !== key) return;
    }
    callback();
  };

  window.addEventListener("storage", handler);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(STORAGE_EVENT, handler);
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyStorage(key);
  } catch {
    // Storage can be unavailable in private browsing. The demo still works in-memory.
  }
}

function sortReports(reports: Report[]): Report[] {
  return [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getHistory(): Report[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    const samples = createSampleReports();
    writeJson(HISTORY_KEY, samples);
    return sortReports(samples);
  }
  return sortReports(readJson<Report[]>(HISTORY_KEY, []));
}

export function saveReport(report: Report): void {
  const reports = getHistory().filter((entry) => entry.id !== report.id);
  writeJson(HISTORY_KEY, sortReports([report, ...reports]));
}

export function getReportById(id: string): Report | null {
  return getHistory().find((report) => report.id === id) ?? null;
}

export function saveDraft(session: InterviewSession): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota issues.
  }
}

export function getDraft(): InterviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as InterviewSession) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

export function saveLastConfig(config: InterviewConfig): void {
  writeJson(LAST_CONFIG_KEY, config);
}

export function getLastConfig(): InterviewConfig | null {
  return readJson<InterviewConfig | null>(LAST_CONFIG_KEY, null);
}

export function getUser(): UserProfile | null {
  return readJson<UserProfile | null>(USER_KEY, null);
}

export function saveUser(user: UserProfile): void {
  writeJson(USER_KEY, user);
}

export function clearUser(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(USER_KEY);
  notifyStorage(USER_KEY);
}

export function clearDemoHistory(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(HISTORY_KEY);
  notifyStorage(HISTORY_KEY);
}
