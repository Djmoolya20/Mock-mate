import type { Persona } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PersonaAvatarProps {
  persona: Persona;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  xs: "size-9 rounded-[11px]",
  sm: "size-11 rounded-[14px]",
  md: "size-14 rounded-[18px]",
  lg: "size-20 rounded-[24px]",
  xl: "size-28 rounded-[32px]",
};

export function PersonaAvatar({
  persona,
  size = "md",
  className,
}: PersonaAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden ring-1 ring-ink/10",
        SIZE_CLASS[size],
        className,
      )}
      style={{ backgroundColor: persona.surfaceHex }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {persona.id === "maya" && (
          <>
            <path d="M18 100c3-22 14-33 32-33s29 11 32 33Z" fill="#354357" />
            <path d="M50 18c-16 0-25 12-25 27 0 15 10 27 25 27s25-12 25-27c0-15-9-27-25-27Z" fill="#3D2C25" />
            <ellipse cx="50" cy="47" rx="18" ry="21" fill="#E8B48C" />
            <path d="M31 39c1-15 9-23 20-23 12 0 19 9 20 22-8-6-12-9-21-9-7 0-13 4-19 10Z" fill="#3D2C25" />
            <circle cx="43" cy="47" r="1.8" fill="#2C201B" />
            <circle cx="57" cy="47" r="1.8" fill="#2C201B" />
            <path d="M44 56c3.8 3.3 8.2 3.3 12 0" fill="none" stroke="#8E4E3A" strokeWidth="2" strokeLinecap="round" />
            <path d="M27 96c4-12 12-19 23-20" fill="none" stroke="#D8FF57" strokeWidth="5" strokeLinecap="round" />
            <path d="M73 96c-4-12-12-19-23-20" fill="none" stroke="#D8FF57" strokeWidth="5" strokeLinecap="round" />
            <circle cx="33" cy="53" r="3" fill="#E6A33E" />
          </>
        )}

        {persona.id === "atlas" && (
          <>
            <rect x="15" y="68" width="70" height="36" rx="12" fill="#202B38" />
            <path d="M50 15c-17 0-26 11-26 27 0 17 10 29 26 29s26-12 26-29c0-16-9-27-26-27Z" fill="#2A1D1A" />
            <ellipse cx="50" cy="48" rx="18" ry="21" fill="#C98E68" />
            <path d="M29 40c2-14 9-21 21-21 13 0 20 8 22 21-8-4-14-6-22-6-9 0-15 2-21 6Z" fill="#2A1D1A" />
            <rect x="34" y="41" width="13" height="10" rx="4" fill="none" stroke="#202B38" strokeWidth="2.4" />
            <rect x="53" y="41" width="13" height="10" rx="4" fill="none" stroke="#202B38" strokeWidth="2.4" />
            <path d="M47 46h6" stroke="#202B38" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="40.5" cy="46" r="1.5" fill="#202B38" />
            <circle cx="59.5" cy="46" r="1.5" fill="#202B38" />
            <path d="M45 60c3-1.5 7-1.5 10 0" fill="none" stroke="#7E4A3A" strokeWidth="2" strokeLinecap="round" />
            <path d="M33 96l6-19h22l6 19" fill="#FF7A59" opacity=".9" />
            <path d="M50 77v19" stroke="#F5DFD2" strokeWidth="2" />
          </>
        )}

        {persona.id === "noor" && (
          <>
            <path d="M17 100c3-24 15-35 33-35s30 11 33 35Z" fill="#3E3A70" />
            <path d="M50 10c-20 0-31 15-31 34 0 23 12 37 31 37s31-14 31-37c0-19-11-34-31-34Z" fill="#6D62A8" />
            <ellipse cx="50" cy="49" rx="17" ry="20" fill="#D9A57E" />
            <path d="M33 39c2-14 8-21 17-21 10 0 16 7 18 21-5-5-11-8-18-8s-13 3-17 8Z" fill="#4A407F" />
            <circle cx="43" cy="49" r="1.7" fill="#2E2731" />
            <circle cx="57" cy="49" r="1.7" fill="#2E2731" />
            <path d="M45 58c3.3 2.5 7.4 2.5 10 0" fill="none" stroke="#9C5C45" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M31 94c2-10 10-16 19-17" fill="none" stroke="#C9C2FF" strokeWidth="5" strokeLinecap="round" />
            <path d="M69 94c-2-10-10-16-19-17" fill="none" stroke="#C9C2FF" strokeWidth="5" strokeLinecap="round" />
            <circle cx="67" cy="50" r="2.6" fill="#F2C94C" />
          </>
        )}
      </svg>
    </span>
  );
}
