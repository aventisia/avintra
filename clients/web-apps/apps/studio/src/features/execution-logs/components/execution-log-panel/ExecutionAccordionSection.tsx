import { DayTimelineCount, DayTimelineItem, DayTimelineSection } from "@/components/day-timeline";

import { DaySection } from "../../types/log-list-type";
import { isErrorStatus } from "../../utils/job-log-level";
import ExecutionLogAccordionItem from "./ExecutionLogAccordionItem";

type Props = {
  section: DaySection;
  isFirst: boolean;
  isLast: boolean;
  selectedEntry: string;
  onSelect: (id: string) => void;
};

export default function ExecutionAccordionSection({
  section,
  isFirst,
  isLast,
  selectedEntry,
  onSelect,
}: Props) {
  const errorCount = section.entries.filter((entry) => isErrorStatus(entry.status)).length;

  return (
    <DayTimelineSection
      day={section.date}
      startedAt={section.startedAt}
      isFirst={isFirst}
      isLast={isLast}
      meta={
        <>
          {errorCount > 0 ? (
            <span className="rounded-full bg-bad/10 px-1.5 text-[11px] font-medium leading-[18px] tabular-nums text-bad">
              {errorCount} {errorCount === 1 ? "error" : "errors"}
            </span>
          ) : null}
          <DayTimelineCount count={section.entries.length} noun="run" />
        </>
      }
    >
      {section.entries.map((entry) => (
        <DayTimelineItem key={entry.id}>
          <ExecutionLogAccordionItem
            entry={entry}
            isSelected={entry.id === selectedEntry}
            onClick={onSelect}
          />
        </DayTimelineItem>
      ))}
    </DayTimelineSection>
  );
}
