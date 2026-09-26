import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "indigo";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-zinc-800 text-zinc-100 border border-zinc-700/60",
    secondary:
      "bg-zinc-900 text-zinc-300 border border-zinc-800",
    indigo:
      "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    success:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    warning:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    danger:
      "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    outline:
      "border border-zinc-700/80 text-zinc-300 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
