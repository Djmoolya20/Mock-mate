import type { Difficulty, PersonaId, ScoreBand } from "./types";

export function cn(
  ...classes: Array<
    string | false | null | undefined | Record<string, boolean | undefined>
  >
): string {
  return classes
    .flatMap((entry) => {
      if (!entry) return [];
      if (typeof entry === "string") return [entry];
      return Object.entries(entry)
        .filter(([, active]) => active)
        .map(([name]) => name);
    })
    .join(" ");
}

export function formatDate(iso: string, style: "long" | "short" = "short"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder.toString().padStart(2, "0")}s`;
}

export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function scoreBand(score: number): ScoreBand {
  if (score >= 85) return "strong";
  if (score >= 72) return "steady";
  return "watch";
}

export function scoreCopy(score: number): string {
  if (score >= 88) return "Interview-ready";
  if (score >= 80) return "Strong signal";
  if (score >= 70) return "Promising";
  return "Warming up";
}

export function difficultyLabel(difficulty: Difficulty): string {
  if (difficulty === "gentle") return "Warm-up";
  if (difficulty === "pressure") return "Pressure test";
  return "Realistic";
}

export function personaShortName(id: PersonaId): string {
  if (id === "atlas") return "Atlas";
  if (id === "noor") return "Noor";
  return "Maya";
}

export function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "P";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length > 1) return initials(parts.join(" "));
  return local.slice(0, 2).toUpperCase();
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
