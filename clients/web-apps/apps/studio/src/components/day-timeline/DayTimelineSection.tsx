import { AccordionContent, AccordionItem, AccordionTrigger } from "@avplatform/ui/accordion";
import { cn } from "@avplatform/ui/lib";
import { CaretRightIcon } from "@phosphor-icons/react";
import { createContext, useContext } from "react";

import { formatDayLabel } from "@/utils/format-day-label.util";

import { DAY_RAIL, ENTRY_RAIL } from "./day-timeline-rail.constant";

const DIVIDER_MASK_BG = "bg-surface group-hover:bg-hover";

const SectionContext = createContext({ isLast: false });

type DayTimelineSectionProps = {
  day: string;
  startedAt: number;
  isFirst: boolean;
  isLast: boolean;
  /** Right-aligned summary such as counts and badges. */
  meta?: React.ReactNode;
  children: React.ReactNode;
};

export const DayTimelineSection = ({
  day,
  startedAt,
  isFirst,
  isLast,
  meta,
  children,
}: DayTimelineSectionProps) => (
  <AccordionItem value={day} className="border-none">
    <AccordionTrigger
      className={cn(
        "group relative flex h-9 w-full items-center gap-2 rounded-none px-4 py-0 hover:bg-hover hover:no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-focus [&>svg]:hidden",
        DAY_RAIL,
        isFirst && "before:hidden",
        isLast && "data-[state=closed]:after:hidden",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-8 right-4 top-1/2 hidden h-px bg-line group-data-[state=open]:block"
      />
      <span className="relative grid size-4 shrink-0 place-items-center rounded-full border border-line-strong/60 bg-surface">
        <CaretRightIcon
          weight="bold"
          className="size-2.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90 motion-reduce:transition-none"
        />
      </span>
      <span
        className={cn(
          "relative min-w-0 truncate pr-2 text-left text-[13px] font-semibold text-ink",
          DIVIDER_MASK_BG,
        )}
      >
        {formatDayLabel(startedAt)}
      </span>
      {meta ? (
        <span
          className={cn("relative ml-auto flex shrink-0 items-center gap-2 pl-2", DIVIDER_MASK_BG)}
        >
          {meta}
        </span>
      ) : null}
    </AccordionTrigger>

    <AccordionContent className="p-0 px-2">
      <SectionContext.Provider value={{ isLast }}>
        <ul className="flex flex-col">{children}</ul>
      </SectionContext.Provider>
    </AccordionContent>
  </AccordionItem>
);

/** List item that carries the rail through its entry marker. */
export const DayTimelineItem = ({ children }: { children: React.ReactNode }) => {
  const { isLast } = useContext(SectionContext);
  return (
    <li
      className={cn("group/entry relative last:pb-1.5", ENTRY_RAIL, isLast && "last:after:hidden")}
    >
      {children}
    </li>
  );
};

/** Muted mono count for a section's meta slot, e.g. "3 runs". */
export const DayTimelineCount = ({ count, noun }: { count: number; noun: string }) => (
  <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
    {count} {count === 1 ? noun : `${noun}s`}
  </span>
);
