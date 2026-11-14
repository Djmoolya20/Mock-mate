"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  History,
  ScanFace,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PersonaAvatar } from "@/components/persona-avatar";
import { TrendChart, type TrendPoint } from "@/components/trend-chart";
import { buttonClass } from "@/components/ui/button";
import { getInterviewType, PERSONA_MAP } from "@/lib/data";
import { useStoredHistory } from "@/lib/use-storage";
import type { Report } from "@/lib/types";
import {
  cn,
  formatDate,
  formatRelativeDate,
  scoreCopy,
} from "@/lib/utils";

type Metric = "overall" | "content" | "presence";

const METRIC_STYLE: Record<
  Metric,
  { label: string; color: string; className: string }
> = {
  overall: { label: "Readiness", color: "#17181C", className: "bg-ink text-cream" },
  content: { label: "Content", color: "#66712B", className: "bg-[#EBF3C9] text-ink" },
  presence: { label: "Presence", color: "#B34C33", className: "bg-[#FFE1D7] text-ink" },
};

export default function HistoryPage() {
  const { reports } = useStoredHistory();
  const [metric, setMetric] = useState<Metric>("overall");

  const ordered = useMemo(() => (reports ? [...reports].reverse() : []), [reports]);

  const average = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;

  const avgOverall = average(reports?.map((report) => report.overallScore) ?? []);
  const avgContent = average(reports?.map((report) => report.contentScore) ?? []);
  const avgPresence = average(reports?.map((report) => report.presenceScore) ?? []);

  const dimensionAverages = useMemo(() => {
    if (!reports?.length) return [];
    const totals = new Map<string, { label: string; total: number; count: number }>();
    reports.forEach((report) => {
      report.contentDimensions.forEach((dimension) => {
        const current = totals.get(dimension.key) ?? {
          label: dimension.label,
          total: 0,
          count: 0,
        };
        current.total += dimension.score;
        current.count += 1;
        totals.set(dimension.key, current);
      });
    });
    return [...totals.values()]
      .map((entry) => ({
        label: entry.label,
        score: Math.round(entry.total / entry.count),
      }))
      .sort((a, b) => b.score - a.score);
  }, [reports]);

  const points: TrendPoint[] = ordered.map((report) => ({
    date: report.createdAt,
    score:
      metric === "overall"
        ? report.overallScore
        : metric === "content"
          ? report.contentScore
          : report.presenceScore,
    label: report.config.targetRole,
  }));

  const delta =
    points.length > 1 ? points[points.length - 1].score - points[0].score : 0;
  const latest = reports?.[0];
  const hasSamples = reports?.some((report) => report.sample) ?? false;
  const bestDimension = dimensionAverages[0];

  return (
    <div className="mx-auto max-w-[1240px]">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            <span className="size-1.5 rounded-full bg-lime" />
            Progress · every room counts
          </div>
          <h1 className="mt-4 max-w-[760px] font-display text-[clamp(3.2rem,5.5vw,5.2rem)] leading-[0.88] tracking-[-0.04em] text-balance">
            Your practice,
            <br />
            <span className="italic text-coral">over time.</span>
          </h1>
          <p className="mt-4 max-w-[540px] text-[13px] leading-6 text-muted">
            A single interview is a snapshot. The useful story is the line between
            them — what is becoming automatic, and what still needs a room.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-cream/60 px-3 py-2 text-[9px] font-semibold text-muted sm:inline-flex">
            <CalendarDays size={11} />
            All time
          </span>
          <Link
            href="/setup"
            className={buttonClass("primary", "md", "h-10 px-4 text-[11px]")}
          >
            New interview
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {reports === null ? (
        <HistoryLoading />
      ) : reports.length === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-[24px] bg-ink p-5 text-cream">
              <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-lime/15 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/35">
                  Sessions
                </p>
                <History size={14} className="text-lime/60" />
              </div>
              <p className="relative mt-5 font-display text-[42px] leading-none tracking-[-0.04em]">
                {String(reports.length).padStart(2, "0")}
              </p>
              <p className="relative mt-2 text-[9px] text-white/35">
                {reports.length === 1 ? "One room in the books." : "Rooms in the books."}
              </p>
            </div>

            <StatCard
              label="Average readiness"
              icon={TrendingUp}
              value={`${avgOverall}`}
              suffix="/100"
              note={scoreCopy(avgOverall)}
              accent="bg-[#EBF3C9]"
            />

            <StatCard
              label="Strongest signal"
              icon={Target}
              value={bestDimension?.label ?? "—"}
              note={bestDimension ? `${bestDimension.score} average` : "No data yet"}
              accent="bg-[#E9E5FF]"
              small
            />

            <StatCard
              label="Last room"
              icon={ScanFace}
              value={latest ? formatRelativeDate(latest.createdAt) : "—"}
              note={latest ? `${latest.config.targetRole} · ${PERSONA_MAP[latest.config.personaId].name}` : "Start when ready"}
              accent="bg-[#FFE1D7]"
              small
            />
          </div>

          <section className="mt-4 rounded-[30px] border border-line bg-cream/65 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  The trend
                </p>
                <h2 className="mt-2 font-display text-[32px] leading-none tracking-[-0.03em]">
                  Progress, not perfection.
                </h2>
              </div>
              <div className="flex w-fit rounded-full border border-line bg-paper p-1">
                {(Object.keys(METRIC_STYLE) as Metric[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMetric(key)}
                    className={cn(
                      "focus-ring rounded-full px-3.5 py-2 text-[9.5px] font-semibold transition-colors",
                      metric === key
                        ? METRIC_STYLE[key].className
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {METRIC_STYLE[key].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-7 lg:grid-cols-[230px_1fr] lg:gap-10">
              <div className="flex flex-col justify-between rounded-2xl bg-white/45 p-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {METRIC_STYLE[metric].label} average
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="font-display text-[58px] leading-[0.82] tracking-[-0.05em]">
                      {metric === "overall"
                        ? avgOverall
                        : metric === "content"
                          ? avgContent
                          : avgPresence}
                    </span>
                    <span className="pb-1 text-[9px] text-muted">/ 100</span>
                  </div>
                  <span
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8.5px] font-semibold",
                      delta >= 0
                        ? "bg-lime/45 text-ink/65"
                        : "bg-coral/20 text-[#974026]",
                    )}
                  >
                    <ArrowUpRight
                      size={10}
                      className={delta < 0 ? "rotate-90" : ""}
                    />
                    {points.length > 1
                      ? `${delta >= 0 ? "+" : ""}${delta} since first`
                      : "Building the line"}
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <TrendRow label="Content" value={avgContent} />
                  <TrendRow label="Presence" value={avgPresence} />
                </div>
              </div>

              <div className="min-w-0">
                <TrendChart
                  points={points}
                  color={METRIC_STYLE[metric].color}
                  height={245}
                />
                <div className="mt-2 flex flex-col justify-between gap-2 border-t border-line/70 pt-3 text-[9px] text-muted sm:flex-row">
                  <span>
                    {metric === "overall"
                      ? "Blended content and presence."
                      : metric === "content"
                        ? "How clearly your answers landed."
                        : "How you showed up in the room."}
                  </span>
                  {hasSamples && <span>Includes sample sessions, marked below.</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  The archive
                </p>
                <h2 className="mt-2 font-display text-[34px] leading-none tracking-[-0.03em]">
                  Every room.
                </h2>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-muted">
                <span>{reports.length} sessions</span>
                {hasSamples && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles size={10} className="text-coral" />
                    Sample data included
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-line bg-cream/55">
              <div className="hidden grid-cols-[1.5fr_0.9fr_0.55fr_0.55fr_0.55fr_28px] gap-4 border-b border-line px-5 py-3 text-[8px] font-bold uppercase tracking-[0.14em] text-muted/60 md:grid">
                <span>Session</span>
                <span>Room</span>
                <span className="text-right">Content</span>
                <span className="text-right">Presence</span>
                <span className="text-right">Readiness</span>
                <span />
              </div>

              <div className="divide-y divide-line">
                {reports.map((report) => (
                  <SessionRow key={report.id} report={report} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  icon: Icon,
  value,
  suffix,
  note,
  accent,
  small = false,
}: {
  label: string;
  icon: typeof Target;
  value: string;
  suffix?: string;
  note: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-line bg-cream/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
        <span className={cn("grid size-7 place-items-center rounded-full", accent)}>
          <Icon size={13} className="text-ink/55" />
        </span>
      </div>
      <p
        className={cn(
          "mt-5 font-display leading-none tracking-[-0.04em]",
          small ? "text-[27px]" : "text-[42px]",
        )}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-[10px] font-normal tracking-normal text-muted">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-2 truncate text-[9px] text-muted">{note}</p>
    </div>
  );
}

function TrendRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-ink/[0.07]">
        <div
          className="h-full rounded-full bg-ink/60"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SessionRow({ report }: { report: Report }) {
  const persona = PERSONA_MAP[report.config.personaId];
  const round = getInterviewType(report.config.interviewType);

  return (
    <Link
      href={`/report/${report.id}`}
      className="focus-ring group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-white/45 md:grid-cols-[1.5fr_0.9fr_0.55fr_0.55fr_0.55fr_28px] md:gap-4 md:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <PersonaAvatar persona={persona} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[11.5px] font-semibold">
              {report.config.targetRole}
            </p>
            {report.sample && (
              <span className="shrink-0 rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-muted">
                Sample
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[9px] text-muted">
            {formatDate(report.createdAt)} · {persona.name}
          </p>
        </div>
      </div>

      <div className="hidden md:block">
        <p className="text-[10px] font-medium text-ink/60">{round.label}</p>
        <p className="mt-0.5 text-[8.5px] text-muted">
          {report.answers.length} questions
        </p>
      </div>

      <ScoreCell value={report.contentScore} className="hidden md:flex" />
      <ScoreCell value={report.presenceScore} className="hidden md:flex" />

      <div className="flex items-center justify-end gap-3">
        <div className="md:hidden">
          <p className="text-right text-[8px] uppercase tracking-[0.1em] text-muted">
            Readiness
          </p>
          <p className="text-[18px] font-semibold tabular-nums">
            {report.overallScore}
          </p>
        </div>
        <span className="hidden min-w-[38px] justify-end text-[17px] font-semibold tabular-nums md:flex">
          {report.overallScore}
        </span>
        <span className="grid size-6 place-items-center rounded-full text-ink/25 transition-colors group-hover:bg-ink group-hover:text-lime">
          <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function ScoreCell({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "items-center justify-end gap-1.5 text-[11px] font-semibold tabular-nums text-ink/65",
        className,
      )}
    >
      <span className="hidden h-1 w-8 overflow-hidden rounded-full bg-ink/[0.07] lg:block">
        <span
          className="block h-full rounded-full bg-ink/45"
          style={{ width: `${value}%` }}
        />
      </span>
      {value}
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="mt-8 grid place-items-center rounded-[30px] border border-dashed border-line bg-cream/50 px-6 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-ink text-lime">
        <History size={20} />
      </span>
      <h2 className="mt-5 font-display text-[34px] leading-none tracking-[-0.03em]">
        The line starts here.
      </h2>
      <p className="mt-3 max-w-[320px] text-[11px] leading-6 text-muted">
        Finish your first interview and this page will become a record of what is
        changing.
      </p>
      <Link
        href="/setup"
        className={buttonClass("primary", "md", "mt-6")}
      >
        Start a room
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-[156px] animate-pulse rounded-[24px] bg-cream"
          />
        ))}
      </div>
      <div className="h-[430px] animate-pulse rounded-[30px] bg-cream" />
    </div>
  );
}
