"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Lightbulb,
  Loader2,
  Mic,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { CameraPreview } from "@/components/camera-preview";
import { Logo } from "@/components/logo";
import { PersonaAvatar } from "@/components/persona-avatar";
import { Button } from "@/components/ui/button";
import { getDifficulty, getInterviewType, PERSONA_MAP } from "@/lib/data";
import {
  buildReport,
  generatePresenceMetrics,
  sleep,
  submitAnswer,
} from "@/lib/interview";
import { clearDraft, saveDraft, saveReport, STORAGE_KEYS } from "@/lib/store";
import { parseStoredJson, useStorageValue } from "@/lib/use-storage";
import type { InterviewSession } from "@/lib/types";
import { cn, difficultyLabel, formatTimer } from "@/lib/utils";

const QUESTION_LABELS = {
  intro: "The opener",
  technical: "Craft",
  behavioral: "Story",
  reflection: "The close",
};

export default function InterviewPage() {
  const router = useRouter();
  const rawDraft = useStorageValue(STORAGE_KEYS.draft, "session");

  useEffect(() => {
    if (rawDraft === null) {
      router.replace("/setup");
    }
  }, [rawDraft, router]);

  if (rawDraft === undefined || rawDraft === null) {
    return <InterviewLoading />;
  }

  const initialSession = parseStoredJson<InterviewSession | null>(rawDraft, null);
  if (!initialSession) return <InterviewLoading />;

  return <InterviewRoom initialSession={initialSession} />;
}

function InterviewRoom({ initialSession }: { initialSession: InterviewSession }) {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession>(initialSession);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [elapsed, setElapsed] = useState(() =>
    Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(initialSession.startedAt).getTime()) / 1000,
      ),
    ),
  );
  const [confirmExit, setConfirmExit] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(
        Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(session.startedAt).getTime()) / 1000,
          ),
        ),
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.startedAt]);

  const send = async () => {
    if (submitting || finishing || answer.trim().length < 2) return;
    setError("");
    setSubmitting(true);

    try {
      const result = await submitAnswer(session, answer);
      setSession(result.session);
      saveDraft(result.session);

      if (result.isComplete) {
        setFinishing(true);
        const metrics = generatePresenceMetrics(result.session.id);
        const report = buildReport(result.session, metrics, {
          durationSeconds: Math.max(1, elapsed),
        });
        saveReport(report);
        clearDraft();
        await sleep(1200);
        router.push(`/report/${report.id}`);
        return;
      }

      setAnswer("");
      setSubmitting(false);
    } catch {
      setError("The interviewer lost the thread. Please send that answer again.");
      setSubmitting(false);
    }
  };

  const persona = PERSONA_MAP[session.config.personaId];
  const question = session.questions[session.currentIndex];
  const total = session.questions.length;
  const currentNumber = Math.min(session.currentIndex + 1, total);
  const answered = session.answers.length;
  const progress = (answered / total) * 100;
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const round = getInterviewType(session.config.interviewType);
  const difficulty = getDifficulty(session.config.difficulty);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-4 sm:px-7">
          <Logo />
          <div className="hidden items-center gap-2 rounded-full border border-line bg-cream/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted sm:flex">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-coral" />
            Interview in progress
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-cream/60 px-3 font-mono text-[11px] tabular-nums text-ink/65">
              <Clock3 size={12} className="text-ink/35" />
              {formatTimer(elapsed)}
            </span>
            <button
              type="button"
              onClick={() => setConfirmExit(true)}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-cream/60 px-3 text-[10px] font-semibold text-muted transition-colors hover:border-ink/25 hover:text-ink"
            >
              <X size={12} />
              <span className="hidden sm:inline">End session</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-6 sm:px-7 sm:pt-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start">
          <div>
            <section className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-cream sm:p-8">
              <div
                className="pointer-events-none absolute -right-24 -top-28 size-[360px] rounded-full opacity-20 blur-[70px]"
                style={{ backgroundColor: persona.accentHex }}
              />
              <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />

              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PersonaAvatar persona={persona} size="md" />
                  <div>
                    <p className="text-[12px] font-semibold text-white/85">
                      {persona.name}
                    </p>
                    <p className="text-[9.5px] text-white/35">
                      {persona.title} · {round.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
                    {difficulty.label}
                  </span>
                  <span className="font-mono text-[10px] text-white/30">
                    {String(currentNumber).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="relative mt-7 min-h-[130px]">
                {submitting && !finishing ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime/60">
                      {persona.name} is reading your answer
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="shimmer-dark h-4 w-4/5 rounded-full" />
                      <div className="shimmer-dark h-4 w-3/5 rounded-full" />
                      <div className="shimmer-dark h-4 w-2/5 rounded-full" />
                    </div>
                    <p className="mt-5 flex items-center gap-2 text-[10px] text-white/25">
                      <Sparkles size={12} className="text-lime/40" />
                      Finding the next thread to pull...
                    </p>
                  </div>
                ) : (
                  <div key={question?.id}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-lime/55">
                      {QUESTION_LABELS[question.kind]}
                    </p>
                    <h1 className="mt-3 max-w-[850px] font-display text-[clamp(1.9rem,3.6vw,3.15rem)] leading-[1.03] tracking-[-0.025em] text-white/95 text-balance">
                      {question.text}
                    </h1>
                  </div>
                )}
              </div>

              <div className="relative mt-7 flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-lime/50" />
                <p className="text-[10px] leading-5 text-white/35">{question.hint}</p>
              </div>

              <div className="relative mt-6">
                <div className="flex items-center justify-between text-[8.5px] font-semibold uppercase tracking-[0.12em] text-white/25">
                  <span>Room progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {session.questions.map((item, index) => (
                    <span
                      key={item.id}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-500",
                        index < answered
                          ? "bg-lime"
                          : index === answered
                            ? "bg-white/35"
                            : "bg-white/10",
                      )}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[28px] border border-line bg-cream/70 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-muted">
                    Your answer
                  </p>
                  <p className="mt-1 text-[10px] text-muted/70">
                    Write it the way you would say it. Specific beats polished.
                  </p>
                </div>
                <span className="hidden items-center gap-1.5 text-[9px] font-medium text-muted sm:flex">
                  <span className="size-1.5 rounded-full bg-ink/20" />
                  Draft kept locally
                </span>
              </div>

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    void send();
                  }
                }}
                disabled={submitting || finishing}
                rows={7}
                autoFocus
                placeholder={`Start with your first sentence. ${persona.name} will follow the thread from there...`}
                className="focus-ring mt-4 w-full resize-none rounded-2xl border border-line bg-white/70 px-4 py-4 text-[13px] leading-7 text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink/25 focus:bg-white disabled:opacity-60 sm:text-[14px]"
              />

              <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4 text-[9.5px] text-muted/70">
                  <span>
                    {words} {words === 1 ? "word" : "words"}
                  </span>
                  <span className="hidden h-3 w-px bg-line sm:block" />
                  <span className="hidden sm:inline">
                    Ctrl + Enter to send
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    title="Voice answers are the next milestone"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white/40 px-3.5 text-[10px] font-semibold text-muted/50"
                  >
                    <Mic size={13} />
                    Voice
                    <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-ink/35">
                      Soon
                    </span>
                  </button>
                  <Button
                    variant="primary"
                    onClick={send}
                    disabled={submitting || finishing || words < 2}
                    className="group h-10 min-w-[136px] justify-between px-4 text-[12px]"
                  >
                    {submitting ? (
                      <>
                        Reading...
                        <Loader2 size={14} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Send answer
                        <span className="grid size-6 place-items-center rounded-full bg-lime text-ink transition-transform group-hover:translate-x-0.5">
                          <ArrowRight size={13} />
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-xl bg-coral/15 px-3.5 py-2.5 text-[10px] font-medium text-[#974026]">
                  {error}
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-line bg-cream/65 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-muted">
                  In the room
                </p>
                <span className="font-mono text-[9px] text-muted/60">
                  R01
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <PersonaAvatar persona={persona} size="sm" />
                <div>
                  <p className="text-[12px] font-semibold">{persona.name}</p>
                  <p className="text-[9px] text-muted">{persona.title}</p>
                </div>
                <span className="ml-auto rounded-full bg-ink/[0.05] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-ink/40">
                  In character
                </span>
              </div>

              <div className="mt-4 space-y-1.5">
                {session.questions.map((item, index) => {
                  const isDone = index < answered;
                  const isCurrent = index === session.currentIndex && !finishing;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                        isCurrent && "bg-white/70",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4.5 shrink-0 place-items-center rounded-full border text-[8px] font-semibold",
                          isDone
                            ? "border-ink bg-ink text-lime"
                            : isCurrent
                              ? "border-coral text-coral"
                              : "border-ink/15 text-ink/25",
                        )}
                      >
                        {isDone ? <Check size={9} strokeWidth={3} /> : index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-[9.5px]",
                          isCurrent
                            ? "font-semibold text-ink"
                            : isDone
                              ? "text-ink/40 line-through decoration-ink/20"
                              : "text-ink/30",
                        )}
                      >
                        {QUESTION_LABELS[item.kind]}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-[8px] font-semibold uppercase tracking-[0.1em] text-coral">
                          Now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-line bg-cream/65 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-muted">
                  Session
                </p>
                <Timer size={13} className="text-ink/25" />
              </div>
              <div className="mt-3 space-y-2.5">
                <SideRow label="Target" value={session.config.targetRole} />
                <SideRow label="Round" value={round.label} />
                <SideRow label="Pressure" value={difficultyLabel(session.config.difficulty)} />
                <SideRow
                  label="Answer mode"
                  value="Text"
                />
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-[9px] leading-4 text-muted/70">
                  You can end the session at any time. Your draft stays in this
                  browser.
                </p>
              </div>
            </div>

            <CameraPreview />
          </aside>
        </div>
      </main>

      {confirmExit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
        >
          <div className="w-full max-w-[380px] rounded-[26px] bg-cream p-6 shadow-2xl">
            <span className="grid size-10 place-items-center rounded-full bg-coral/15 text-coral">
              <ArrowLeft size={18} />
            </span>
            <h2
              id="leave-title"
              className="mt-4 font-display text-[30px] leading-none tracking-[-0.03em]"
            >
              Leave this room?
            </h2>
            <p className="mt-3 text-[11px] leading-5 text-muted">
              Your draft is saved locally. You can start again from the studio, but
              this session will not produce a report.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmExit(false)}
              >
                Keep answering
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push("/setup")}
              >
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}

      {finishing && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-ink px-6 text-cream">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 size-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/10" />
            <div className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/15" />
            <div className="absolute left-1/2 top-1/2 size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl" />
          </div>
          <div className="relative text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full border border-lime/30 bg-lime/10">
              <Loader2 size={23} className="animate-spin text-lime" />
            </div>
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em] text-lime/60">
              Pulling the room together
            </p>
            <h2 className="mx-auto mt-3 max-w-[440px] font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.035em]">
              Content and presence,
              <span className="italic text-lime"> one read.</span>
            </h2>
            <p className="mt-4 text-[11px] text-white/35">
              Reading {answered} answers and your presence signals.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink text-cream">
      <div className="text-center">
        <Logo theme="dark" className="justify-center" />
        <p className="mt-4 text-[11px] text-white/35">Opening the room...</p>
      </div>
    </div>
  );
}

function SideRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[9px] text-muted/70">{label}</span>
      <span className="max-w-[165px] text-right text-[9.5px] font-semibold leading-4 text-ink/70">
        {value}
      </span>
    </div>
  );
}
