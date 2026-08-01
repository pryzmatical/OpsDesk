import { HTMLAttributes } from "react";

type Tone = "neutral" | "blue" | "amber" | "green" | "red" | "purple";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-border/60 text-foreground",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
