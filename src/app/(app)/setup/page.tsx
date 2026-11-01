"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { PersonaAvatar } from "@/components/persona-avatar";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CONFIG,
  DIFFICULTY_OPTIONS,
  getDifficulty,
  getInterviewType,
  INTERVIEW_TYPE_OPTIONS,
  PERSONAS,
  PERSONA_MAP,
  ROLE_SUGGESTIONS,
  SAMPLE_JD,
} from "@/lib/data";
import { createSession, sleep } from "@/lib/interview";
import { STORAGE_KEYS, saveDraft, saveLastConfig } from "@/lib/store";
import {
  parseStoredJson,
  useStorageValue,
  useStoredUser,
} from "@/lib/use-storage";
import type {
  Difficulty,
  InterviewConfig,
  InterviewType,
  PersonaId,
  UserProfile,
} from "@/lib/types";
import { cn, initials } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SetupPage() {
  const rawLastConfig = useStorageValue(STORAGE_KEYS.lastConfig);
  const user = useStoredUser();

  if (rawLastConfig === undefined) {
    return <SetupLoading />;
  }

  const last = parseStoredJson<InterviewConfig | null>(rawLastConfig, null);
  const initialConfig: InterviewConfig = last
    ? {
        ...last,
        resumeFileName: undefined,
        resumeS3Key: undefined,
      }
    : DEFAULT_CONFIG;

  return <SetupForm initialConfig={initialConfig} user={user} />;
}

function SetupForm({
  initialConfig,
  user,
}: {
  initialConfig: InterviewConfig;
  user: UserProfile | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<InterviewConfig>(initialConfig);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [starting, setStarting] = useState(false);

  const update = <K extends keyof InterviewConfig>(
    key: K,
    value: InterviewConfig[K],
  ) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const attachResume = (file: File | null) => {
    setResumeError("");
    if (!file) return;
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      setResumeError("Use a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("That file is over 5 MB. Try a smaller version.");
      return;
    }
    setResume(file);
    update("resumeFileName", file.name);
    update("resumeS3Key", `uploads/${file.name}`);
  };

  const removeResume = () => {
    setResume(null);
    update("resumeFileName", undefined);
    update("resumeS3Key", undefined);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    attachResume(event.dataTransfer.files?.[0] ?? null);
  };

  const startInterview = async () => {
    if (!config.targetRole.trim() || starting) return;
    setStarting(true);
    const finalConfig = { ...config, targetRole: config.targetRole.trim() };
    saveLastConfig(finalConfig);
    await sleep(950);
    const session = createSession(finalConfig);
    saveDraft(session);
    router.push("/interview");
  };

  const persona = PERSONA_MAP[config.personaId];
  const difficulty = getDifficulty(config.difficulty);
  const interviewType = getInterviewType(config.interviewType);
  const ready = Boolean(config.targetRole.trim());
  const optionalReady = Boolean(resume || config.jdText.trim());

  return (
    <div className="mx-auto max-w-[1240px]">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            <span className="size-1.5 rounded-full bg-coral" />
            New interview · Room 01
          </div>
          <h1 className="mt-4 max-w-[700px] font-display text-[clamp(3.2rem,5.6vw,5.3rem)] leading-[0.88] tracking-[-0.04em] text-balance">
            Let&apos;s build
            <br />
            your <span className="italic text-coral">room.</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-muted">
            Choose the role, the pressure, and the person across the table. You can
            change any of it before you start.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream/60 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-[11px] font-semibold text-cream">
            {user ? initials(user.name) : "G"}
          </span>
          <div>
            <p className="text-[11px] font-semibold">{user?.name ?? "Guest candidate"}</p>
            <p className="text-[10px] text-muted">5 questions · about 8 minutes</p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_356px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-line bg-cream/55 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[10px] text-coral">01</span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    The brief
                  </h2>
                  <p className="mt-1 text-[11px] text-muted">
                    Give the interviewer something real to work with.
                  </p>
                </div>
              </div>
              <BriefcaseBusiness size={18} className="text-ink/25" />
            </div>

            <div className="mt-7">
              <label
                htmlFor="target-role"
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted"
              >
                Target role
              </label>
              <input
                id="target-role"
                value={config.targetRole}
                onChange={(event) => update("targetRole", event.target.value)}
                placeholder="e.g. Product Designer"
                className="focus-ring mt-2.5 w-full rounded-2xl border border-line bg-white/60 px-4 py-3.5 text-[19px] font-semibold tracking-[-0.025em] text-ink outline-none transition-colors placeholder:font-medium placeholder:text-ink/20 focus:border-ink/35 focus:bg-white"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {ROLE_SUGGESTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => update("targetRole", role)}
                    className={cn(
                      "focus-ring rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors",
                      config.targetRole === role
                        ? "border-ink bg-ink text-cream"
                        : "border-line bg-white/30 text-muted hover:border-ink/25 hover:text-ink",
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  <MessageSquareText size={12} />
                  Round type
                </p>
                <div className="mt-2.5 space-y-2">
                  {INTERVIEW_TYPE_OPTIONS.map((option) => {
                    const active = config.interviewType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          update("interviewType", option.id as InterviewType)
                        }
                        className={cn(
                          "focus-ring flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
                          active
                            ? "border-ink/25 bg-white shadow-[0_2px_12px_rgba(23,24,28,.05)]"
                            : "border-transparent bg-transparent hover:bg-white/40",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border",
                            active
                              ? "border-ink bg-ink text-lime"
                              : "border-ink/20 text-transparent",
                          )}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span>
                          <span className="block text-[11px] font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-muted">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  <Gauge size={12} />
                  Difficulty
                </p>
                <div className="mt-2.5 space-y-2">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const active = config.difficulty === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          update("difficulty", option.id as Difficulty)
                        }
                        className={cn(
                          "focus-ring flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
                          active
                            ? "border-ink/25 bg-white shadow-[0_2px_12px_rgba(23,24,28,.05)]"
                            : "border-transparent bg-transparent hover:bg-white/40",
                        )}
                      >
                        <span className="flex h-5 w-7 shrink-0 items-end gap-[3px]">
                          {[1, 2, 3].map((bar) => (
                            <span
                              key={bar}
                              className={cn(
                                "w-1 rounded-full transition-colors",
                                bar === 1 && "h-2",
                                bar === 2 && "h-3.5",
                                bar === 3 && "h-5",
                                option.id === "gentle" && bar <= 1 && active
                                  ? "bg-lime"
                                  : option.id === "gentle" && bar <= 1
                                    ? "bg-ink/25"
                                    : "bg-ink/15",
                                option.id === "realistic" && bar <= 2 && active
                                  ? "bg-coral"
                                  : option.id === "realistic" && bar <= 2
                                    ? "bg-ink/25"
                                    : "bg-ink/15",
                                option.id === "pressure" && active
                                  ? "bg-[#B65A45]"
                                  : option.id === "pressure"
                                    ? "bg-ink/25"
                                    : "bg-ink/15",
                              )}
                            />
                          ))}
                        </span>
                        <span>
                          <span className="block text-[11px] font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-4 text-muted">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-cream/55 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[10px] text-coral">02</span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Who&apos;s across the table?
                  </h2>
                  <p className="mt-1 text-[11px] text-muted">
                    The same answer can land differently depending on the room.
                  </p>
                </div>
              </div>
              <Sparkles size={18} className="text-ink/25" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {PERSONAS.map((option) => {
                const active = config.personaId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => update("personaId", option.id as PersonaId)}
                    aria-pressed={active}
                    className={cn(
                      "focus-ring group relative overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-200",
                      active
                        ? "border-ink/60 bg-white shadow-[0_8px_30px_rgba(23,24,28,.08)]"
                        : "border-line bg-white/30 hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white/60",
                    )}
                  >
                    <div
                      className="pointer-events-none absolute -right-5 -top-5 size-20 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
                      style={{ backgroundColor: option.accentHex }}
                    />
                    <div className="relative flex items-start justify-between">
                      <PersonaAvatar persona={option} size="md" />
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border transition-colors",
                          active
                            ? "border-ink bg-ink text-lime"
                            : "border-ink/15 text-transparent",
                        )}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    </div>
                    <p className="relative mt-4 text-[15px] font-semibold tracking-[-0.02em]">
                      {option.name}
                    </p>
                    <p className="relative text-[10px] font-medium text-ink/45">
                      {option.title}
                    </p>
                    <p className="relative mt-2.5 text-[10.5px] leading-[1.55] text-muted">
                      {option.short}. {option.description}
                    </p>
                    <div className="relative mt-4 flex flex-wrap gap-1.5">
                      {option.traits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full border border-ink/10 px-2 py-0.5 text-[8.5px] font-semibold text-ink/45"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-cream/55 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[10px] text-coral">03</span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Give it context
                  </h2>
                  <p className="mt-1 text-[11px] text-muted">
                    Optional, but this is what turns a generic interview into yours.
                  </p>
                </div>
              </div>
              <FileText size={18} className="text-ink/25" />
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Resume
              </p>

              {resume ? (
                <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-ink/15 bg-white/70 p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/50 text-ink">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold">{resume.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {formatBytes(resume.size)} · ready to attach
                    </p>
                  </div>
                  <span className="hidden items-center gap-1 rounded-full bg-lime/50 px-2.5 py-1 text-[9px] font-semibold text-ink/70 sm:inline-flex">
                    <CheckCircle2 size={11} />
                    Attached
                  </span>
                  <button
                    type="button"
                    onClick={removeResume}
                    aria-label="Remove resume"
                    className="focus-ring grid size-8 place-items-center rounded-full text-ink/35 hover:bg-ink/[0.06] hover:text-ink"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInput.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      fileInput.current?.click();
                    }
                  }}
                  className={cn(
                    "focus-ring mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition-colors",
                    dragging
                      ? "border-ink/40 bg-lime/15"
                      : "border-ink/15 bg-white/30 hover:border-ink/30 hover:bg-white/60",
                  )}
                >
                  <span className="grid size-10 place-items-center rounded-full border border-line bg-cream text-ink/50">
                    <UploadCloud size={18} />
                  </span>
                  <p className="mt-3 text-[11px] font-semibold">
                    Drop your resume here, or{" "}
                    <span className="underline underline-offset-2">browse</span>
                  </p>
                  <p className="mt-1 text-[9.5px] text-muted">
                    PDF, DOC, or DOCX · up to 5 MB
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(event) =>
                      attachResume(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
              )}
              {resumeError && (
                <p className="mt-2 text-[10px] font-medium text-[#A8452D]">
                  {resumeError}
                </p>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="job-description"
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted"
                >
                  Job description
                </label>
                <button
                  type="button"
                  onClick={() => update("jdText", SAMPLE_JD)}
                  className="text-[9.5px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
                >
                  Use a sample JD
                </button>
              </div>
              <textarea
                id="job-description"
                value={config.jdText}
                onChange={(event) => update("jdText", event.target.value)}
                rows={4}
                placeholder="Paste the role description here. The interviewer will use it to ground the questions."
                className="focus-ring mt-2.5 w-full rounded-2xl border border-line bg-white/60 px-4 py-3.5 text-[12px] leading-6 text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink/35 focus:bg-white"
              />
              <div className="mt-1.5 flex justify-between text-[9px] text-muted/80">
                <span>Optional — but it sharpens the questions.</span>
                <span>{config.jdText.length} chars</span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-ink/[0.035] px-3.5 py-3">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ink/45" />
              <p className="text-[10px] leading-5 text-muted">
                In the demo, your resume stays in this browser. The production flow
                sends it straight to S3 with a pre-signed URL, so the file never
                passes through the app server.
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-[28px] bg-ink text-cream shadow-[0_24px_70px_rgba(23,24,28,.18)]">
            <div className="relative overflow-hidden border-b border-white/10 p-6">
              <div
                className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full opacity-25 blur-3xl"
                style={{ backgroundColor: persona.accentHex }}
              />
              <div className="relative flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Your room
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 text-[9px] font-semibold text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Ready
                </span>
              </div>

              <div className="relative mt-6 flex items-center gap-3">
                <PersonaAvatar persona={persona} size="lg" />
                <div>
                  <p className="font-display text-[26px] leading-none text-white/95">
                    {persona.name}
                  </p>
                  <p className="mt-1.5 text-[10px] text-white/35">{persona.title}</p>
                </div>
              </div>
              <p className="relative mt-4 text-[11px] leading-5 text-white/40">
                “{persona.voice}”
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-3">
                <SummaryRow label="Role" value={config.targetRole || "Choose a role"} />
                <SummaryRow label="Round" value={interviewType.label} />
                <SummaryRow label="Difficulty" value={difficulty.label} />
                <SummaryRow
                  label="Resume"
                  value={resume ? resume.name : "Not attached"}
                  muted={!resume}
                />
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-2.5">
                <CheckRow label="Role selected" done={ready} />
                <CheckRow label="Interviewer chosen" done />
                <CheckRow label="Extra context" done={optionalReady} optional />
                <CheckRow label="Camera check in the room" done={false} optional />
              </div>

              <Button
                variant="lime"
                size="lg"
                onClick={startInterview}
                disabled={!ready || starting}
                className="group mt-2 w-full justify-between px-5 text-ink"
              >
                {starting ? "Setting the room..." : "Start interview"}
                {starting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-lime transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={15} />
                  </span>
                )}
              </Button>

              <p className="text-center text-[9.5px] leading-4 text-white/30">
                5 questions · text answers · about 8 minutes
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-line bg-cream/50 px-4 py-3.5">
            <Camera size={15} className="mt-0.5 shrink-0 text-ink/40" />
            <p className="text-[10px] leading-5 text-muted">
              The camera check is optional. If you enable it, your preview and
              presence metrics stay on this device.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SetupLoading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse">
      <div className="border-b border-line pb-8">
        <div className="h-3 w-36 rounded-full bg-ink/[0.06]" />
        <div className="mt-5 h-16 w-[430px] max-w-full rounded-2xl bg-ink/[0.07]" />
        <div className="mt-4 h-4 w-[480px] max-w-full rounded-full bg-ink/[0.05]" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_356px]">
        <div className="space-y-5">
          <div className="h-[520px] rounded-[28px] bg-cream" />
          <div className="h-[360px] rounded-[28px] bg-cream" />
        </div>
        <div className="h-[560px] rounded-[28px] bg-ink/90" />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] text-white/30">{label}</span>
      <span
        className={cn(
          "max-w-[190px] text-right text-[10.5px] font-semibold leading-4",
          muted ? "text-white/35" : "text-white/75",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CheckRow({
  label,
  done,
  optional = false,
}: {
  label: string;
  done: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full border",
          done
            ? "border-lime bg-lime text-ink"
            : "border-white/15 text-transparent",
        )}
      >
        <Check size={9} strokeWidth={3.5} />
      </span>
      <span className={cn("text-[10px]", done ? "text-white/65" : "text-white/30")}>
        {label}
      </span>
      {optional && (
        <span className="ml-auto text-[8px] font-semibold uppercase tracking-[0.1em] text-white/20">
          Optional
        </span>
      )}
    </div>
  );
}
