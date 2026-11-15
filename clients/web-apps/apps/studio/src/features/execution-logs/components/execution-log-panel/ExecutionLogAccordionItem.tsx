import { cn } from "@avplatform/ui/lib";

import { DayTimelineEntry } from "@/components/day-timeline";

import { LogEntry } from "../../types/log-list-type";
import { LEVEL_STYLES, STATUS_LEVEL } from "../../utils/job-log-level";

interface Props {
  entry: LogEntry;
  isSelected: boolean;
  onClick: (id: string) => void;
}

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

export default function ExecutionLogAccordionItem({ entry, isSelected, onClick }: Props) {
  const levelStyle = LEVEL_STYLES[STATUS_LEVEL[entry.status] ?? "info"];

  return (
    <DayTimelineEntry
      isSelected={isSelected}
      onSelect={() => onClick(entry.id)}
      markerClassName={cn(levelStyle.shape, levelStyle.text)}
      title={entry.time}
      aside={formatSecondsToCompactDuration(entry.duration)}
      subtitle={
        <>
          <span className={cn("shrink-0 font-medium", levelStyle.text)}>{levelStyle.label}</span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <span className="truncate font-mono text-muted-foreground">#{entry.id.slice(0, 8)}</span>
        </>
      }
    />
  );
}
