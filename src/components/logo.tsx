import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
  markOnly?: boolean;
}

export function Logo({ theme = "light", className, markOnly = false }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="Poise"
    >
      <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-lime">
        <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
          <circle
            cx="16"
            cy="16"
            r="6.2"
            fill="none"
            stroke="#17181C"
            strokeWidth="1.8"
          />
          <circle cx="16" cy="16" r="2.1" fill="#17181C" />
          <path
            d="M16 3.5v3.8M16 24.7v3.8M3.5 16h3.8M24.7 16h3.8"
            stroke="#17181C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!markOnly && (
        <span
          className={cn(
            "text-[21px] font-semibold tracking-[-0.055em]",
            theme === "dark" ? "text-cream" : "text-ink",
          )}
        >
          poise<span className="text-coral">.</span>
        </span>
      )}
    </span>
  );
}
