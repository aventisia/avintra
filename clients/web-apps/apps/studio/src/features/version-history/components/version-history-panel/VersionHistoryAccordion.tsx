import {
  DayTimeline,
  DayTimelineCount,
  DayTimelineItem,
  DayTimelineSection,
} from "@/components/day-timeline";

import { DaySection } from "../../types/agent-history-type";
import VersionHistoryEntry from "./VersionHistoryEntry";

interface Props {
  data: DaySection[];
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function VersionHistoryAccordion({ data, selectedEntry, onSelect }: Props) {
  const latestId = data[0]?.entries[0]?.id;

  return (
    <DayTimeline days={data} selectedId={selectedEntry}>
      {data.map((section, index) => (
        <DayTimelineSection
          key={section.date}
          day={section.date}
          startedAt={section.startedAt}
          isFirst={index === 0}
          isLast={index === data.length - 1}
          meta={<DayTimelineCount count={section.entries.length} noun="change" />}
        >
          {section.entries.map((entry) => (
            <DayTimelineItem key={entry.id}>
              <VersionHistoryEntry
                entry={entry}
                isLatest={entry.id === latestId}
                isSelected={entry.id === selectedEntry}
                onSelect={onSelect}
              />
            </DayTimelineItem>
          ))}
        </DayTimelineSection>
      ))}
    </DayTimeline>
  );
}
