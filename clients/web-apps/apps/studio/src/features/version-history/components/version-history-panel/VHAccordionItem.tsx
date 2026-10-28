import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";
import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef } from "react";

import { HistoryEntry } from "../../types/agent-history-type";
import VersionHistoryActions from "./version-history-actions";

interface Props {
  entry: HistoryEntry;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function VHAccordionItem({ entry, isSelected, onClick }: Props) {
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

  return (
    <div ref={ref} className="relative pb-1 last:pb-0.5" onClick={() => onClick(entry.id)}>
      {isSelected && (
        <div className="pointer-events-none absolute -left-0.5 top-1 h-[calc(100%-0.5rem)] w-1 rounded-full bg-indicator" />
      )}

      <div
        className={cn(
          "ml-3 flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all duration-200",
          isSelected ? "border-line bg-selected text-ink" : "hover:bg-hover",
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-0">
            <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
            <AvatarFallback className="border border-line bg-fill font-mono text-[9.5px] font-medium uppercase text-ink-2">
              {entry.user.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-mono text-xs text-ink">{entry.time}</span>
            <span className="text-2xs text-muted-foreground">{entry.user.name}</span>
          </div>
        </div>

        <VersionHistoryActions id={entry.id} />
      </div>
    </div>
  );
}
