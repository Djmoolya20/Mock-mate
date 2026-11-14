import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "lime" | "coral";
type ButtonSize = "sm" | "md" | "lg";

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45",
    {
      "bg-ink text-cream hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0":
        variant === "primary",
      "border border-ink/20 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.04]":
        variant === "outline",
      "bg-transparent text-ink hover:bg-ink/[0.06]": variant === "ghost",
      "bg-lime text-ink hover:-translate-y-0.5 hover:bg-lime-soft active:translate-y-0":
        variant === "lime",
      "bg-coral text-ink hover:-translate-y-0.5 hover:bg-[#ff8e73] active:translate-y-0":
        variant === "coral",
      "h-9 px-4 text-[13px]": size === "sm",
      "h-11 px-5 text-sm": size === "md",
      "h-[52px] px-7 text-[15px]": size === "lg",
    },
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}
