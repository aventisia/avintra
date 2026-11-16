import { DayTimeline } from "@/components/day-timeline";

import { DaySection } from "../../types/log-list-type";
import ExecutionAccordionSection from "./ExecutionAccordionSection";

interface Props {
  data: DaySection[];
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function ExecutionLogAccordion({ data, selectedEntry, onSelect }: Props) {
  return (
    <DayTimeline days={data} selectedId={selectedEntry}>
      {data.map((section, index) => (
        <ExecutionAccordionSection
          key={section.date}
          section={section}
          isFirst={index === 0}
          isLast={index === data.length - 1}
          selectedEntry={selectedEntry}
          onSelect={onSelect}
        />
      ))}
    </DayTimeline>
  );
}
