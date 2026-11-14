"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  History,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { clearUser } from "@/lib/store";
import { useStoredUser } from "@/lib/use-storage";
import { cn, initials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/setup", label: "Studio", icon: LayoutGrid },
  { href: "/history", label: "History", icon: History },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStoredUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-paper">
      <aside className="dark-scroll fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-y-auto bg-ink px-5 py-6 text-cream lg:flex">
        <Link href="/setup" className="focus-ring-light w-fit rounded-lg" aria-label="Poise studio">
          <Logo theme="dark" />
        </Link>
        <p className="mt-2 pl-[42px] text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
          Interview studio
        </p>

        <Link
          href="/setup"
          className={buttonClass(
            "lime",
            "md",
            "mt-8 w-full justify-between bg-lime px-4 text-[13px]",
          )}
        >
          New interview
          <span className="grid size-6 place-items-center rounded-full bg-ink/10">
            <Plus size={14} strokeWidth={2.4} />
          </span>
        </Link>

        <nav className="mt-8 space-y-1" aria-label="Workspace">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring-light flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-white/[0.09] text-white"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white/85",
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? "text-lime" : ""}
                />
                {item.label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-lime" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
              <ShieldCheck size={14} />
              Private by design
            </div>
            <p className="mt-2.5 text-[12px] leading-5 text-white/45">
              Your camera feed stays in this browser. Only the scores you choose to
              save are stored.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-cream">
              {user ? initials(user.name) : "G"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white/85">
                {user?.name ?? "Guest candidate"}
              </p>
              <p className="truncate text-[10px] text-white/35">
                {user?.email ?? "Demo workspace"}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="focus-ring-light grid size-8 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur-md lg:hidden">
        <Link href="/setup" className="focus-ring rounded-lg" aria-label="Poise studio">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/history"
            aria-label="Interview history"
            className="focus-ring grid size-10 place-items-center rounded-full text-ink/65 hover:bg-ink/[0.06]"
          >
            <History size={18} />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="focus-ring grid size-10 place-items-center rounded-full text-ink/65 hover:bg-ink/[0.06]"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-line bg-cream px-5 py-5 shadow-xl lg:hidden">
          <nav className="space-y-1" aria-label="Mobile workspace">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                    pathname === item.href
                      ? "bg-ink text-cream"
                      : "text-ink/65 hover:bg-ink/[0.05]",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-[11px] font-semibold text-cream">
              {user ? initials(user.name) : "G"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.name ?? "Guest candidate"}</p>
              <p className="truncate text-[10px] text-muted">{user?.email ?? "Demo workspace"}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="text-xs font-semibold text-muted underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <div className="mx-auto w-full max-w-[1480px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
