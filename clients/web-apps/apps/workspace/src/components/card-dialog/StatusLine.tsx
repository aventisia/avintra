import { cn } from "@avplatform/ui/lib";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const TONES = {
  idle: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
  open: { dot: "bg-ok", text: "text-muted-foreground" },
  pending: { dot: "bg-primary", text: "font-medium text-ink-2" },
  warning: { dot: "", text: "font-medium text-warn" },
  error: { dot: "bg-bad", text: "font-medium text-bad" },
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
      <span className={cn("size-2 shrink-0 rounded-full", TONES[tone].dot)} />
    )}
    <span className={cn("min-w-0", tone !== "error" && "flex items-center gap-1.5 truncate")}>
      {children}
    </span>
  </p>
);
