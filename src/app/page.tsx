import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  Eye,
  LineChart,
  ScanFace,
  Sparkles,
  Target,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PersonaAvatar } from "@/components/persona-avatar";
import { buttonClass } from "@/components/ui/button";
import { PERSONAS, PERSONA_MAP } from "@/lib/data";

const FEATURES = [
  {
    number: "01",
    title: "A conversation, not a quiz",
    body: "Your interviewer listens, follows up, and adapts to the answer you actually gave. Choose the tone: warm mentor, strict tech lead, or calm HR panelist.",
    icon: Sparkles,
    surface: "bg-[#EBF3C9]",
    iconBg: "bg-lime",
  },
  {
    number: "02",
    title: "Reads the room, too",
    body: "Eye contact, posture, and nervous tells are measured in your browser. No video leaves your device. The camera is there to make practice feel real.",
    icon: ScanFace,
    surface: "bg-[#FFE1D7]",
    iconBg: "bg-coral",
  },
  {
    number: "03",
    title: "One honest next step",
    body: "Content and presence land in the same report. You leave with the strongest line in your answer, the tell to watch, and exactly what to rehearse next.",
    icon: LineChart,
    surface: "bg-[#E9E5FF]",
    iconBg: "bg-lilac",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Build your room",
    body: "Pick a role, a difficulty, and the interviewer you want to face. Drop in the job description so the questions fit the job.",
  },
  {
    step: "02",
    title: "Take the seat",
    body: "Answer five adaptive questions by text. The camera preview is optional, but it is where the most useful feedback comes from.",
  },
  {
    step: "03",
    title: "Read the room",
    body: "Get a content score, a presence read, and a short rehearsal plan. Then run it again with the hard part fixed.",
  },
];

export default function Home() {
  const maya = PERSONA_MAP.maya;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-48 size-[620px] rounded-full bg-lime/[0.11] blur-[110px]" />
          <div className="absolute -bottom-64 -left-40 size-[520px] rounded-full bg-coral/[0.08] blur-[110px]" />
          <div className="dot-grid-light absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        </div>

        <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
          <Link href="/" className="focus-ring-light rounded-lg" aria-label="Poise home">
            <Logo theme="dark" />
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-white/50 md:flex">
            <a href="#signals" className="transition-colors hover:text-white">
              The read
            </a>
            <a href="#how" className="transition-colors hover:text-white">
              How it works
            </a>
            <Link
              href="/report/sample_2"
              className="transition-colors hover:text-white"
            >
              Sample report
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-in"
              className={buttonClass("lime", "sm", "h-10 px-4")}
            >
              Start practising
              <ArrowUpRight size={14} strokeWidth={2.2} />
            </Link>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid max-w-[1320px] gap-16 px-5 pb-28 pt-12 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-10 lg:px-10 lg:pb-36 lg:pt-16">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.045] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
              <span className="animate-pulse-dot size-1.5 rounded-full bg-lime" />
              A mock interview that reads the room
            </div>

            <h1 className="mt-7 max-w-[660px] font-display text-[clamp(4rem,8.2vw,7.4rem)] leading-[0.86] tracking-[-0.045em] text-balance">
              Practice the <span className="italic text-lime">room</span>,
              <br />
              not just the answers.
            </h1>

            <p className="mt-7 max-w-[505px] text-[15px] leading-7 text-white/50 sm:text-base">
              Poise runs a live mock interview in the persona you choose, then reads
              both what you said and how you showed up. Content, presence, and one
              clear next step — before it counts.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-in"
                className={buttonClass(
                  "lime",
                  "lg",
                  "group h-14 justify-between bg-lime px-6 text-[14px] sm:min-w-[230px]",
                )}
              >
                Start a mock interview
                <span className="grid size-8 place-items-center rounded-full bg-ink text-lime transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight size={16} />
                </span>
              </Link>
              <Link
                href="/report/sample_2"
                className="focus-ring-light inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-semibold text-white/70 transition-colors hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
              >
                See a sample read
                <ArrowUpRight size={16} className="text-lime" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-white/35">
              <span className="inline-flex items-center gap-2">
                <Check size={13} className="text-lime" />
                No credit card
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={13} className="text-lime" />
                Camera stays on device
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={13} className="text-lime" />
                8-minute first session
              </span>
            </div>

            <div className="mt-11 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {PERSONAS.map((persona) => (
                  <PersonaAvatar
                    key={persona.id}
                    persona={persona}
                    size="sm"
                    className="ring-2 ring-ink"
                  />
                ))}
              </div>
              <p className="max-w-[230px] text-[11px] leading-5 text-white/35">
                Three interviewers. One honest mirror.
                <span className="block text-white/55">Choose who you need to face.</span>
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-10 -z-10 rounded-full bg-lime/[0.05] blur-3xl" />

            <div className="animate-float-soft absolute -right-3 -top-6 z-30 rounded-2xl bg-lime px-4 py-3 text-ink shadow-[0_18px_50px_rgba(0,0,0,.3)] sm:-right-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-ink text-[12px] font-bold text-lime">
                  84
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/50">
                    Readiness
                  </p>
                  <p className="text-[12px] font-semibold">Strong signal</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[30px] border border-white/10 bg-white/[0.035] p-2.5 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur">
              <div className="overflow-hidden rounded-[23px] border border-white/[0.07] bg-[#1C1E24]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    <span className="animate-pulse-dot size-1.5 rounded-full bg-coral" />
                    Session in progress
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-white/35">
                    04:32
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <PersonaAvatar persona={maya} size="md" />
                      <div>
                        <p className="text-[13px] font-semibold text-white/90">
                          Maya
                        </p>
                        <p className="text-[10px] text-white/35">
                          Friendly mentor · Mixed round
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      3 / 5
                    </span>
                  </div>

                  <p className="mt-5 font-display text-[26px] leading-[1.08] tracking-[-0.02em] text-white/90 sm:text-[29px]">
                    “Tell me about a time you had to defend a design decision you
                    believed in.”
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-lime/70">
                      <AudioLines size={12} />
                      Your answer
                    </div>
                    <p className="mt-2.5 text-[12px] leading-[1.75] text-white/45">
                      I asked us to test both versions with five users instead of
                      debating in the abstract. The simpler version won on
                      comprehension, and we documented the trade-off...
                      <span className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-lime" />
                    </p>
                    <div className="mt-3 flex items-end gap-[3px]" aria-hidden="true">
                      {[8, 14, 20, 11, 6, 17, 13, 22, 9, 15, 7, 19, 12, 6, 16, 10].map(
                        (height, index) => (
                          <span
                            key={index}
                            className="w-[2px] rounded-full bg-lime/25"
                            style={{ height: `${height}px` }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-white/25">
                      Keep the story under 90 seconds
                    </span>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-lime px-3.5 text-[10px] font-bold text-ink">
                      Send answer
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px border-t border-white/[0.07] bg-white/[0.07]">
                  <div className="bg-[#1C1E24] p-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">
                      <Eye size={11} className="text-lime" />
                      Eye contact
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl text-white/85">82%</span>
                      <span className="text-[9px] text-lime/70">+9 vs last</span>
                    </div>
                  </div>
                  <div className="bg-[#1C1E24] p-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">
                      <Target size={11} className="text-coral" />
                      Posture
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl text-white/85">Steady</span>
                      <span className="text-[9px] text-white/25">3 leans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-11 -left-4 z-30 hidden w-[214px] rotate-[-3deg] rounded-2xl bg-cream p-4 text-ink shadow-[0_18px_50px_rgba(0,0,0,.35)] sm:block">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  Your read
                </p>
                <span className="text-[9px] font-semibold text-coral">01</span>
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-5">
                Strong substance. Make the room feel it.
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] font-medium text-ink/45">
                    <span>Content</span>
                    <span>86</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-ink/10">
                    <div className="h-full w-[86%] rounded-full bg-ink" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-medium text-ink/45">
                    <span>Presence</span>
                    <span>76</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-ink/10">
                    <div className="h-full w-[76%] rounded-full bg-coral" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <section
        id="signals"
        className="relative rounded-t-[38px] bg-paper px-5 pb-24 pt-20 text-ink sm:rounded-t-[52px] sm:px-8 sm:pt-24 lg:px-10"
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                Not a question bank
              </p>
              <h2 className="mt-3 max-w-[700px] font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.94] tracking-[-0.035em] text-balance">
                Three signals.
                <br />
                One honest read.
              </h2>
            </div>
            <p className="max-w-[320px] text-[13px] leading-6 text-muted">
              Most practice tools stop at what you said. The interview is a room,
              and the room has information in it.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.number}
                  className={`group relative overflow-hidden rounded-[28px] border border-ink/[0.07] p-6 transition-transform duration-300 hover:-translate-y-1 ${feature.surface}`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid size-11 place-items-center rounded-2xl ${feature.iconBg}`}
                    >
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <span className="font-mono text-[10px] text-ink/30">
                      {feature.number}
                    </span>
                  </div>
                  <h3 className="mt-10 text-[18px] font-semibold tracking-[-0.025em]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[12.5px] leading-6 text-ink/55">
                    {feature.body}
                  </p>
                  <div className="mt-6 h-px w-full bg-ink/10" />
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/35">
                    {feature.number === "01"
                      ? "Adaptive by design"
                      : feature.number === "02"
                        ? "Local inference"
                        : "Built to be used"}
                  </p>
                </article>
              );
            })}
          </div>

          <div
            id="how"
            className="mt-24 grid gap-10 border-t border-line pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                How it works
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.6rem,4vw,3.8rem)] leading-[0.95] tracking-[-0.03em]">
                From nervous
                <br />
                to <span className="italic text-coral">rehearsed.</span>
              </h2>
              <Link
                href="/sign-in"
                className={buttonClass("primary", "lg", "mt-7")}
              >
                Take the seat
                <ArrowRight size={16} className="text-lime" />
              </Link>
            </div>

            <div className="divide-y divide-line">
              {STEPS.map((step) => (
                <div key={step.step} className="grid grid-cols-[48px_1fr] gap-4 py-6 first:pt-0 last:pb-0">
                  <span className="font-mono text-[10px] text-muted">{step.step}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-[-0.015em]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[430px] text-[12.5px] leading-6 text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-24 overflow-hidden rounded-[32px] bg-ink px-7 py-10 text-cream sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-24 -top-32 size-[340px] rounded-full bg-lime/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime/70">
                  The next interview is not the rehearsal
                </p>
                <h2 className="mt-4 max-w-[650px] font-display text-[clamp(2.6rem,4.4vw,4.4rem)] leading-[0.92] tracking-[-0.035em] text-balance">
                  Walk in ready.
                  <br />
                  Not <span className="italic text-lime">rehearsed.</span>
                </h2>
              </div>
              <Link
                href="/sign-in"
                className={buttonClass(
                  "lime",
                  "lg",
                  "group shrink-0 bg-lime text-ink",
                )}
              >
                Start your first room
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-paper px-5 pb-10 text-ink sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-5 border-t border-line pt-7 sm:flex-row sm:items-center">
          <Logo />
          <p className="text-[10px] text-muted">
            AI interview studio · Built for the First Commit Hackathon
          </p>
          <div className="flex gap-5 text-[10px] font-medium text-muted">
            <Link href="/sign-in" className="hover:text-ink">
              Sign in
            </Link>
            <Link href="/report/sample_2" className="hover:text-ink">
              Sample report
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
