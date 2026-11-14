"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PersonaAvatar } from "@/components/persona-avatar";
import { Button } from "@/components/ui/button";
import { PERSONA_MAP } from "@/lib/data";
import { sleep } from "@/lib/interview";
import { saveUser } from "@/lib/store";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("Mayuresh");
  const [email, setEmail] = useState("mayuresh@poise.demo");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setError("Add your details to continue. This demo accepts anything you type.");
      return;
    }

    setLoading(true);
    await sleep(700);
    saveUser({
      name: (mode === "signup" ? name : name || "Mayuresh").trim() || "Mayuresh",
      email: email.trim(),
    });
    router.push("/setup");
  };

  const maya = PERSONA_MAP.maya;

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-cream lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 size-[440px] rounded-full bg-lime/10 blur-[90px]" />
          <div className="absolute -bottom-40 -left-32 size-[380px] rounded-full bg-coral/10 blur-[90px]" />
          <div className="dot-grid-light absolute inset-0 opacity-30" />
        </div>

        <Link href="/" className="focus-ring-light relative z-10 w-fit rounded-lg">
          <Logo theme="dark" />
        </Link>

        <div className="relative z-10 my-auto max-w-[520px] py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime/70">
            The interview studio
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.6rem,5.2vw,5.5rem)] leading-[0.9] tracking-[-0.04em] text-balance">
            The interview is not a memory test.
            <span className="italic text-lime"> It&apos;s a room.</span>
          </h1>
          <p className="mt-6 max-w-[410px] text-[14px] leading-7 text-white/45">
            Rehearse the questions, the pauses, and the way you show up. Poise
            gives you a safe room and an honest read before the real one.
          </p>

          <div className="mt-12 rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <PersonaAvatar persona={maya} size="md" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-white/85">
                  Maya is ready
                </p>
                <p className="text-[10px] text-white/35">
                  Friendly mentor · Adaptive interview
                </p>
              </div>
              <span className="size-2 rounded-full bg-lime" />
            </div>
            <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
                A question to sit with
              </p>
              <p className="mt-2 font-display text-[22px] leading-[1.12] text-white/80">
                “What is the weakest part of your answer today — and what would you
                do differently?”
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] text-white/30">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={13} className="text-lime/70" />
            Camera feed stays local
          </span>
          <span>First Commit · 2026</span>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="focus-ring rounded-lg lg:hidden" aria-label="Poise home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full py-2 text-[11px] font-semibold text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} />
            Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-coral">
            <Sparkles size={13} />
            Demo workspace
          </div>
          <h2 className="mt-4 font-display text-[clamp(3rem,5vw,4.1rem)] leading-[0.92] tracking-[-0.035em]">
            {mode === "signin" ? "Take the seat." : "Make a room."}
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-muted">
            {mode === "signin"
              ? "Sign in to pick up your practice or start a fresh interview."
              : "Create your practice space. Your first mock interview is minutes away."}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-full border border-line bg-paper p-1">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setError("");
                }}
                className={cn(
                  "focus-ring rounded-full px-4 py-2.5 text-[12px] font-semibold transition-colors",
                  mode === tab
                    ? "bg-ink text-cream shadow-sm"
                    : "text-muted hover:text-ink",
                )}
              >
                {tab === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-ink/65">
                  Full name
                </span>
                <span className="relative block">
                  <UserRound
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                  />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                    className="focus-ring h-12 w-full rounded-xl border border-line bg-white/65 pl-10 pr-4 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink/35 focus:bg-white"
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-ink/65">
                Email
              </span>
              <span className="relative block">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="focus-ring h-12 w-full rounded-xl border border-line bg-white/65 pl-10 pr-4 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink/35 focus:bg-white"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-ink/65">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="At least 8 characters"
                  className="focus-ring h-12 w-full rounded-xl border border-line bg-white/65 pl-10 pr-11 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink/35 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="focus-ring absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink/35 hover:bg-ink/[0.05] hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>

            {error && (
              <p className="rounded-xl bg-coral/15 px-3.5 py-2.5 text-[11px] font-medium text-[#9b3a20]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="group mt-2 w-full justify-between px-5"
              disabled={loading}
            >
              {loading
                ? "Opening the studio..."
                : mode === "signin"
                  ? "Enter the studio"
                  : "Create my workspace"}
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-lime text-ink transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line/80 bg-paper/60 px-3.5 py-3">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ink/45" />
            <p className="text-[10px] leading-5 text-muted">
              This is a hackathon demo. Any details work, and no real account is
              created. In production this screen is powered by Cognito through
              Amplify&apos;s authenticator.
            </p>
          </div>

          <p className="mt-6 text-center text-[10px] text-muted/80">
            By continuing, you agree to keep the feedback kind and the practice honest.
          </p>
        </div>
      </section>
    </div>
  );
}
