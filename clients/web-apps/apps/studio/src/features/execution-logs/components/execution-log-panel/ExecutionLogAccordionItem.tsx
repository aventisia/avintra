import { FALLBACK_STATUS_DISPLAY, STATUS_DISPLAY } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";

import { DayTimelineEntry } from "@/components/day-timeline";

import { LogEntry } from "../../types/log-list-type";
import { formatSecondsToCompactDuration } from "../../utils/format-duration.util";
import { STATUS_TONE_TEXT_CLASS } from "../../utils/status-tone.util";

interface Props {
  entry: LogEntry;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function ExecutionLogAccordionItem({ entry, isSelected, onClick }: Props) {
  const { label, Icon, tone } = STATUS_DISPLAY[entry.status] ?? FALLBACK_STATUS_DISPLAY;
  const toneClass = STATUS_TONE_TEXT_CLASS[tone];

  return (
    <DayTimelineEntry
      isSelected={isSelected}
      onSelect={() => onClick(entry.id)}
      markerClassName={cn("rounded-full bg-current", toneClass)}
      title={entry.time}
      aside={entry.hasEndTime ? formatSecondsToCompactDuration(entry.duration) : "—"}
      subtitle={
        <>
          <Icon className={cn("size-3 shrink-0", toneClass)} aria-hidden="true" />
          <span className={cn("shrink-0 font-medium", toneClass)}>{label}</span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <span className="truncate font-mono text-muted-foreground">#{entry.id.slice(0, 8)}</span>
        </>
      }
    />
  );
}
