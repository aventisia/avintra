import { cn } from "@avplatform/ui/lib";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const TONES = {
  idle: { dot: "bg-slate-400", text: "text-muted-foreground" },
  open: { dot: "bg-emerald-500", text: "text-muted-foreground" },
  pending: { dot: "bg-primary", text: "font-medium text-slate-700" },
  warning: { dot: "", text: "font-medium text-amber-700" },
  error: { dot: "bg-rose-500", text: "font-medium text-rose-600" },
} as const;

type StatusLineProps = {
  tone: keyof typeof TONES;
  children: ReactNode;
};

/**
 * Footer status text with a dot that pulses while a change is pending.
 */
export const StatusLine = ({ tone, children }: StatusLineProps) => (
  <p className={cn("flex min-w-0 items-center gap-2 text-[12.5px]", TONES[tone].text)}>
    {tone === "warning" ? (
      <TriangleAlert className="size-4 shrink-0" />
    ) : (
      <span className="relative grid size-2 shrink-0 place-items-center">
        {tone === "pending" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-60" />
        )}
        <span className={cn("relative size-2 rounded-full", TONES[tone].dot)} />
      </span>
    )}
    <span className={cn("min-w-0", tone !== "error" && "flex items-center gap-1.5 truncate")}>
      {children}
    </span>
  </p>
);
