import { DotSeparator } from "@aventisia/ui";
import { cn } from "@aventisia/ui/lib";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { HistoryEntry } from "../../types/agent-history-type";

// import VersionHistoryActions from "./version-history-actions";

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

  return (
    <div
      ref={ref}
      className="relative pb-1 last:pb-0.5"
      onClick={() => onClick(entry.id)}
    >
      {isSelected && (
        <div className="pointer-events-none absolute -left-0.5 top-1 h-[calc(100%-0.5rem)] w-1 rounded-full bg-primary" />
      )}

      <div
        className={cn(
          "ml-3 flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all duration-200",
          isSelected
            ? "border bg-accent hover:text-primary shadow-sm"
            : "hover:border hover:bg-accent hover:text-primary hover:shadow-sm",
        )}
      >
        <div className="flex items-center gap-0 h-[1.1rem]">
          <div className="flex items-center gap-1.5 h-[1.1rem]">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-medium ">
              #{entry.id.slice(0, 4)}
            </span>
          </div>
          <DotSeparator className="mx-1 h-[1.1rem]" />
          <span className=" text-xs font-medium text-muted-foreground">
            {entry.time}
          </span>
        </div>
        <span className="text-2xs font-medium text-muted-foreground h-[1.1rem]">
          {formatSecondsToCompactDuration(100)}
        </span>
      </div>
    </div>
  );
}
