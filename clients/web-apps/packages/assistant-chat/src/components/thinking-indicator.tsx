import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef, useState } from "react";

/** Default verbs cycled while the assistant is working. */
const DEFAULT_VERBS = ["Thinking", "Reasoning", "Analyzing", "Working"] as const;

const VERB_INTERVAL_MS = 2400;

export type ThinkingIndicatorProps = {
  /** Fixed label; when set, verb rotation is disabled. */
  label?: string;
  /** Verbs to cycle through when no `label` is provided. */
  verbs?: readonly string[];
  /** When the work started; elapsed seconds are measured from here. */
  startedAt?: Date;
  /** Shows the elapsed-seconds badge. Defaults to `true`. */
  showElapsed?: boolean;
  className?: string;
};

/**
 * LLM-style loading affordance: a pulsing dot, a rotating verb (or a fixed
 * label), and an elapsed-seconds badge. Used inside the message `indicator`
 * slot while the assistant is running.
 */
export const ThinkingIndicator = ({
  label,
  verbs = DEFAULT_VERBS,
  startedAt,
  showElapsed = true,
  className,
}: ThinkingIndicatorProps) => {
  const mountedAtRef = useRef(Date.now());
  const [verbIndex, setVerbIndex] = useState(0);
  const [now, setNow] = useState(mountedAtRef.current);

  // Rotate the verb while no explicit label is pinned.
  useEffect(() => {
    if (label || verbs.length <= 1) return;
    const timer = window.setInterval(
      () => setVerbIndex((index) => (index + 1) % verbs.length),
      VERB_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [label, verbs.length]);

  // Tick once a second so the elapsed badge stays current.
  useEffect(() => {
    if (!showElapsed) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [showElapsed]);

  const startedAtMs = startedAt?.getTime() ?? mountedAtRef.current;
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const currentLabel = label ?? verbs[verbIndex] ?? DEFAULT_VERBS[0];

  return (
    <div
      className={cn(
        "aui-thinking-indicator flex items-center gap-2.5 text-sm text-muted-foreground",
        className,
      )}
      aria-label="Assistant is working"
      role="status"
    >
      <span aria-hidden className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <span
        key={currentLabel}
        className="fade-in slide-in-from-bottom-1 animate-in leading-none duration-300 motion-reduce:animate-none"
      >
        {currentLabel}
        <span aria-hidden>…</span>
      </span>
      {showElapsed && elapsedSeconds > 0 && (
        <span className="tabular-nums text-muted-foreground/60">{elapsedSeconds}s</span>
      )}
    </div>
  );
};

export default ThinkingIndicator;
