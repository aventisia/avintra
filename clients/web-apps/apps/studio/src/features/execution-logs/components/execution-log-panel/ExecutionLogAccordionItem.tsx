import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef } from "react";

import { LogEntry } from "../../types/log-list-type";
import { LEVEL_STYLES, STATUS_LEVEL } from "../../utils/job-log-level";

interface Props {
  entry: LogEntry;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function ExecutionLogAccordionItem({ entry, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSelected) return;

    const timeout = setTimeout(() => {
      ref.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 150); // wait for accordion animation

    return () => clearTimeout(timeout);
  }, [isSelected]);

  const formatSecondsToCompactDuration = (totalSeconds?: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "0s";

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts: string[] = [];

    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);

    return parts.join(" ");
  };

  const level = STATUS_LEVEL[entry.status] ?? "info";
  const levelStyle = LEVEL_STYLES[level];
  const isError = level === "error";

  return (
    <div
      ref={ref}
      onClick={() => onClick(entry.id)}
      className={cn(
        "grid cursor-pointer grid-cols-[64px_72px_minmax(0,1fr)_48px] gap-3 px-4 font-mono text-[12.5px]/6 tabular-nums text-ink-2 [&>*]:truncate",
        isError ? "bg-bad/5 shadow-[inset_2px_0_0_var(--bad)] hover:bg-bad/10" : "hover:bg-hover",
        isSelected && "bg-selected text-ink hover:bg-selected",
        isSelected && !isError && "shadow-[inset_2px_0_0_var(--indicator)]",
      )}
    >
      <span className="text-muted-foreground">{entry.time}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.07em]",
          levelStyle.text,
        )}
      >
        <span aria-hidden="true" className={cn("size-1.5 shrink-0", levelStyle.shape)} />
        {levelStyle.label}
      </span>
      <span className={cn(isError || isSelected ? "text-ink" : "text-ink-2")}>
        #{entry.id.slice(0, 8)}
      </span>
      <span className="text-right text-muted-foreground">
        {formatSecondsToCompactDuration(entry.duration)}
      </span>
    </div>
  );
}
