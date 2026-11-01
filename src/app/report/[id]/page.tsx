"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Hand,
  History,
  PersonStanding,
  ScanFace,
  Sparkles,
  Target,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button, buttonClass } from "@/components/ui/button";
import { getDifficulty, getInterviewType, PERSONA_MAP } from "@/lib/data";
import { saveLastConfig } from "@/lib/store";
import { useStoredHistory } from "@/lib/use-storage";
import type { PresenceNote, Report } from "@/lib/types";
import {
  cn,
  formatDate,
  formatDuration,
  scoreCopy,
} from "@/lib/utils";

const PRESENCE_ICONS = {
  eyeContact: Eye,
  posture: PersonStanding,
  gestures: Hand,
  hands: ScanFace,
};

const STATUS_STYLE = {
  strong: {
    label: "Strong",
    pill: "bg-lime/55 text-ink/70",
    icon: "bg-lime/45 text-ink",
  },
  steady: {
    label: "Steady",
    pill: "bg-lilac/40 text-ink/65",
    icon: "bg-lilac/45 text-ink",
  },
  watch: {
    label: "Watch",
    pill: "bg-coral/20 text-[#974026]",
    icon: "bg-coral/25 text-[#974026]",
  },
} as const;

export default function ReportPage() {
  return (
    <Suspense fallback={<ReportLoading />}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { raw, reports } = useStoredHistory();
  const [openAnswer, setOpenAnswer] = useState(0);

  const report = useMemo(
    () => (id && reports ? (reports.find((entry) => entry.id === id) ?? null) : null),
    [id, reports],
  );

  if (raw === undefined || reports === null) {
    return <ReportLoading />;
  }

  if (!report) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="max-w-[380px] text-center">
          <Logo className="justify-center" />
          <h1 className="mt-8 font-display text-[42px] leading-[0.95] tracking-[-0.035em]">
            That read has left the room.
          </h1>
          <p className="mt-3 text-[12px] leading-6 text-muted">
            We could not find this report in the local workspace. Sample reports are
            available from the history page.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/history" className={buttonClass("outline", "md")}>
              <History size={14} />
              History
            </Link>
            <Link href="/setup" className={buttonClass("primary", "md")}>
              New interview
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const persona = PERSONA_MAP[report.config.personaId];
  const round = getInterviewType(report.config.interviewType);
  const difficulty = getDifficulty(report.config.difficulty);
  const hero = heroCopy(report);
  const strongestPresence = [...report.presenceNotes].sort(
    (a, b) => statusWeight(b.status) - statusWeight(a.status),
  )[0];

  const practiceAgain = () => {
    saveLastConfig(report.config);
    router.push("/setup");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-4 sm:px-7">
          <Link href="/setup" className="focus-ring rounded-lg" aria-label="Poise studio">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/history"
              className="focus-ring hidden h-9 items-center gap-1.5 rounded-full px-3 text-[10px] font-semibold text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink sm:inline-flex"
            >
              <History size={13} />
              History
            </Link>
            <Link
              href="/setup"
              className={buttonClass("primary", "sm", "h-9 px-4 text-[10px]")}
            >
              New interview
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-20 pt-6 sm:px-7 sm:pt-8">
        {report.sample && (
          <div className="mb-4 flex flex-col justify-between gap-2 rounded-2xl border border-line bg-cream/60 px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-[10px] text-muted">
              <span className="mr-2 rounded-full bg-ink px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-lime">
                Sample
              </span>
              This is an example read so you can see the shape of the report. Your own
              sessions will appear in history.
            </p>
            <Link
              href="/history"
              className="shrink-0 text-[9.5px] font-semibold text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
            >
              See history
            </Link>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[32px] bg-ink p-6 text-cream shadow-[0_24px_70px_rgba(23,24,28,.16)] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -right-32 -top-40 size-[520px] rounded-full opacity-20 blur-[100px]"
              style={{ backgroundColor: persona.accentHex }}
            />
            <div className="dot-grid-light absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          </div>

          <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.15em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Session read
                </span>
                <span className="text-[9px] text-white/30">
                  {formatDate(report.createdAt, "long")}
                </span>
              </div>

              <h1 className="mt-6 max-w-[690px] font-display text-[clamp(2.9rem,5.1vw,5rem)] leading-[0.9] tracking-[-0.04em] text-balance">
                {hero.lead}
                <br />
                <span className="italic text-lime">{hero.accent}</span>
              </h1>

              <p className="mt-5 max-w-[520px] text-[12px] leading-6 text-white/45">
                {report.summary}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <MetaChip icon={Target} label={report.config.targetRole} />
                <MetaChip icon={ScanFace} label={persona.name} />
                <MetaChip icon={Clock3} label={formatDuration(report.durationSeconds)} />
                <MetaChip icon={CalendarDays} label={round.label} />
              </div>

              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <Button
                  variant="lime"
                  size="lg"
                  onClick={practiceAgain}
                  className="group justify-between px-5 text-ink"
                >
                  Practice this room again
                  <span className="grid size-7 place-items-center rounded-full bg-ink text-lime transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={14} />
                  </span>
                </Button>
                <Link
                  href="/history"
                  className="focus-ring-light inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-[11px] font-semibold text-white/55 transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  <History size={14} />
                  All sessions
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 lg:pl-8">
              <ScoreRing score={report.overallScore} />
              <div className="flex items-center gap-2">
                <ScorePill label="Content" score={report.contentScore} tone="content" />
                <ScorePill label="Presence" score={report.presenceScore} tone="presence" />
              </div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-white/25">
                Weighted readiness score
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[30px] border border-line bg-cream/65 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                The complete read
              </p>
              <h2 className="mt-2 font-display text-[34px] leading-none tracking-[-0.03em]">
                What you said. How you showed up.
              </h2>
            </div>
            <p className="max-w-[330px] text-[10px] leading-5 text-muted">
              Content is judged from your answers. Presence is judged from the room.
              The two are read together, because that is how an interview lands.
            </p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-ink text-[9px] font-bold text-lime">
                    C
                  </span>
                  <p className="text-[12px] font-semibold">Content</p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums">
                  {report.contentScore}
                  <span className="text-[9px] font-normal text-muted"> / 100</span>
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {report.contentDimensions.map((dimension) => (
                  <div key={dimension.key}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10.5px] font-semibold">{dimension.label}</p>
                      <span className="font-mono text-[10px] text-muted">
                        {dimension.score}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                      <div
                        className="h-full rounded-full bg-ink transition-[width] duration-700"
                        style={{ width: `${dimension.score}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[9.5px] leading-4 text-muted">
                      {dimension.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-ink p-5 text-cream">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-lime text-[9px] font-bold text-ink">
                    P
                  </span>
                  <p className="text-[12px] font-semibold">Presence</p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums">
                  {report.presenceScore}
                  <span className="text-[9px] font-normal text-white/30"> / 100</span>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <PresenceMini
                  label="Eye contact"
                  value={`${report.bodyLanguage.eyeContactPercent}%`}
                  status={
                    report.bodyLanguage.eyeContactPercent >= 72 ? "strong" : "steady"
                  }
                />
                <PresenceMini
                  label="Upright"
                  value={`${100 - report.bodyLanguage.posture.slouchPercent}%`}
                  status={
                    100 - report.bodyLanguage.posture.slouchPercent >= 82
                      ? "strong"
                      : "steady"
                  }
                />
                <PresenceMini
                  label="Fidgets"
                  value={`${report.bodyLanguage.gestures.fidgetCount}`}
                  status={
                    report.bodyLanguage.gestures.fidgetCount <= 9 ? "strong" : "watch"
                  }
                />
                <PresenceMini
                  label="Face touch"
                  value={`${report.bodyLanguage.gestures.handsNearFaceCount}×`}
                  status={
                    report.bodyLanguage.gestures.handsNearFaceCount <= 2
                      ? "strong"
                      : "watch"
                  }
                />
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.045] px-3 py-3">
                <Sparkles size={13} className="mt-0.5 shrink-0 text-lime/60" />
                <p className="text-[9.5px] leading-4 text-white/40">
                  Strongest signal:{" "}
                  <span className="font-semibold text-white/70">
                    {strongestPresence.label.toLowerCase()}
                  </span>
                  . {strongestPresence.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-[26px] bg-[#EBF3C9] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-lime">
                  <CheckCircle2 size={16} />
                </span>
                <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
                  What stuck
                </h2>
              </div>
              <span className="font-mono text-[9px] text-ink/30">01</span>
            </div>
            <div className="mt-5 space-y-3.5">
              {report.strengths.map((strength) => (
                <div key={strength} className="flex gap-2.5">
                  <Check size={13} className="mt-0.5 shrink-0 text-ink/55" />
                  <p className="text-[10.5px] leading-5 text-ink/65">{strength}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] bg-[#FFE1D7] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-coral">
                  <ArrowUpRight size={16} />
                </span>
                <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
                  What to tighten
                </h2>
              </div>
              <span className="font-mono text-[9px] text-ink/30">02</span>
            </div>
            <div className="mt-5 space-y-3.5">
              {report.improvements.map((improvement) => (
                <div key={improvement} className="flex gap-2.5">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink/40" />
                  <p className="text-[10.5px] leading-5 text-ink/65">{improvement}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                Presence, in detail
              </p>
              <h2 className="mt-2 font-display text-[34px] leading-none tracking-[-0.03em]">
                What the room saw.
              </h2>
            </div>
            <p className="max-w-[290px] text-[10px] leading-5 text-muted">
              Measured locally across {report.answers.length} questions and{" "}
              {formatDuration(report.durationSeconds)}. These are coaching signals,
              not a verdict.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {report.presenceNotes.map((note) => (
              <PresenceCard key={note.key} note={note} />
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[30px] bg-[#E9E5FF] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5B548C]">
                The next rehearsal
              </p>
              <h2 className="mt-2 font-display text-[36px] leading-none tracking-[-0.03em]">
                Leave with one clear move.
              </h2>
            </div>
            <Link
              href="/setup"
              className={buttonClass("primary", "sm", "h-10 shrink-0")}
            >
              Run it again
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {report.nextSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-[#5B548C]/10 bg-white/45 p-4"
              >
                <span className="font-mono text-[9px] text-[#5B548C]/55">
                  0{index + 1}
                </span>
                <h3 className="mt-7 text-[12px] font-semibold tracking-[-0.015em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[10px] leading-5 text-ink/55">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                The transcript read
              </p>
              <h2 className="mt-2 font-display text-[34px] leading-none tracking-[-0.03em]">
                Question by question.
              </h2>
            </div>
            <span className="text-[10px] text-muted">
              {report.answers.length} answers · {difficulty.label} pressure
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {report.answers.map((entry, index) => {
              const open = openAnswer === index;
              return (
                <div
                  key={`${entry.question.id}-${index}`}
                  className="overflow-hidden rounded-2xl border border-line bg-cream/55"
                >
                  <button
                    type="button"
                    onClick={() => setOpenAnswer(open ? -1 : index)}
                    aria-expanded={open}
                    className="focus-ring flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="font-mono text-[9px] text-muted/60">
                      0{index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted/55">
                        {entry.question.kind}
                      </span>
                      <span className="mt-1 block truncate text-[11.5px] font-medium">
                        {entry.question.text}
                      </span>
                    </span>
                    <span className="hidden rounded-full bg-ink/[0.055] px-2.5 py-1 text-[9px] font-semibold text-ink/60 sm:inline-flex">
                      {entry.evaluation.score.toFixed(1)} / 10
                    </span>
                    <ChevronDown
                      size={15}
                      className={cn(
                        "shrink-0 text-ink/30 transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>

                  {open && (
                    <div className="grid gap-5 border-t border-line px-4 py-5 sm:px-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div>
                        <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-muted/60">
                          Your answer
                        </p>
                        <p className="mt-2 text-[11px] leading-6 text-ink/70">
                          {entry.answer}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-xl bg-lime/25 px-3.5 py-3">
                          <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-ink/40">
                            The note
                          </p>
                          <p className="mt-1.5 text-[10px] leading-5 text-ink/65">
                            {entry.evaluation.headline}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/60 px-3.5 py-3">
                          <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-ink/35">
                            Next time
                          </p>
                          <p className="mt-1.5 text-[10px] leading-5 text-ink/60">
                            {entry.evaluation.improvement}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative mt-14 overflow-hidden rounded-[32px] bg-ink px-6 py-9 text-cream sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-28 size-[340px] rounded-full bg-lime/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-lime/65">
                One more room
              </p>
              <h2 className="mt-3 max-w-[600px] font-display text-[clamp(2.5rem,4.2vw,4.2rem)] leading-[0.92] tracking-[-0.035em]">
                The next interview
                <br />
                is not the <span className="italic text-lime">rehearsal.</span>
              </h2>
            </div>
            <Button
              variant="lime"
              size="lg"
              onClick={practiceAgain}
              className="group shrink-0 justify-between bg-lime text-ink"
            >
              Run this room again
              <span className="grid size-7 place-items-center rounded-full bg-ink text-lime transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={14} />
              </span>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line pb-8">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 px-4 pt-6 sm:flex-row sm:items-center sm:px-7">
          <Logo />
          <p className="text-[9px] text-muted">
            Report generated in the browser · {scoreCopy(report.overallScore)}
          </p>
          <Link
            href="/history"
            className="text-[9px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
          >
            Back to history
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="relative grid size-[164px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#D8FF57 ${score * 3.6}deg, rgba(255,255,255,0.11) 0deg)`,
      }}
    >
      <div className="absolute inset-[7px] rounded-full bg-ink" />
      <div className="relative text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/30">
          Readiness
        </p>
        <p className="mt-0.5 font-display text-[58px] leading-none tracking-[-0.04em] text-white">
          {score}
        </p>
        <p className="mt-1 text-[8px] text-lime/60">{scoreCopy(score)}</p>
      </div>
    </div>
  );
}

function ScorePill({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: "content" | "presence";
}) {
  return (
    <div className="min-w-[86px] rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-center">
      <p className="text-[7.5px] font-bold uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[16px] font-semibold tabular-nums",
          tone === "content" ? "text-white/85" : "text-lime",
        )}
      >
        {score}
      </p>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
}: {
  icon: typeof Target;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[8.5px] text-white/45">
      <Icon size={10} className="text-white/30" />
      {label}
    </span>
  );
}

function PresenceMini({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "strong" | "steady" | "watch";
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8.5px] text-white/35">{label}</span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            status === "strong"
              ? "bg-lime"
              : status === "steady"
                ? "bg-lilac"
                : "bg-coral",
          )}
        />
      </div>
      <p className="mt-1 text-[18px] font-semibold tabular-nums text-white/85">
        {value}
      </p>
    </div>
  );
}

function PresenceCard({ note }: { note: PresenceNote }) {
  const Icon = PRESENCE_ICONS[note.key];
  const style = STATUS_STYLE[note.status];

  return (
    <article className="rounded-[22px] border border-line bg-cream/60 p-4">
      <div className="flex items-start justify-between">
        <span className={cn("grid size-9 place-items-center rounded-xl", style.icon)}>
          <Icon size={17} strokeWidth={1.7} />
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.1em]",
            style.pill,
          )}
        >
          {style.label}
        </span>
      </div>
      <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted/65">
        {note.label}
      </p>
      <p className="mt-1 font-display text-[34px] leading-none tracking-[-0.03em]">
        {note.value}
      </p>
      <p className="mt-3 text-[9.5px] leading-5 text-muted">{note.note}</p>
    </article>
  );
}

function heroCopy(report: Report): { lead: string; accent: string } {
  if (report.overallScore >= 86) {
    return { lead: "You are ready", accent: "for the real room." };
  }
  if (report.overallScore >= 78) {
    return { lead: "Strong substance.", accent: "Now make the room feel it." };
  }
  if (report.overallScore >= 70) {
    return { lead: "A credible read.", accent: "Tighten the middle." };
  }
  return { lead: "The raw material", accent: "is already there." };
}

function statusWeight(status: PresenceNote["status"]): number {
  return status === "strong" ? 2 : status === "steady" ? 1 : 0;
}

function ReportLoading() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center px-4 sm:px-7">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-7">
        <div className="h-[430px] animate-pulse rounded-[32px] bg-ink/90" />
        <div className="mt-4 h-[420px] animate-pulse rounded-[30px] bg-cream" />
      </main>
    </div>
  );
}
