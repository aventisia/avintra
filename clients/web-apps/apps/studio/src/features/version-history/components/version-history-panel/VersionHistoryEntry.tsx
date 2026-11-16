import { cn } from "@avplatform/ui/lib";

import { DayTimelineEntry } from "@/components/day-timeline";

import { HistoryEntry } from "../../types/agent-history-type";
import VersionHistoryActions from "./version-history-actions";

type Props = {
  entry: HistoryEntry;
  isLatest: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function VersionHistoryEntry({ entry, isLatest, isSelected, onSelect }: Props) {
  return (
    <DayTimelineEntry
      isSelected={isSelected}
      onSelect={() => onSelect(entry.id)}
      markerClassName={cn("rounded-full", isSelected ? "bg-ink" : "bg-line-strong")}
      title={entry.time}
      aside={
        isLatest ? (
          <span className="rounded-full border border-line px-1.5 font-sans text-[10.5px] font-medium leading-4 text-ink-2">
            Latest
          </span>
        ) : null
      }
      subtitle={<span className="truncate text-muted-foreground">{entry.user.name}</span>}
      actions={<VersionHistoryActions id={entry.id} />}
    />
  );
}
