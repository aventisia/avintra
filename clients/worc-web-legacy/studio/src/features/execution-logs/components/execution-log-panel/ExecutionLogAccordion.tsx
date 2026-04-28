import { Accordion } from "@aventisia/ui/accordion";
import { useEffect, useState } from "react";

import { DaySection } from "../../types/log-list-type";
import ExecutionAccordionSection from "./ExecutionAccordionSection";

interface Props {
  data: DaySection[];
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function ExecutionLogAccordion({
  data,
  selectedEntry,
  onSelect,
}: Props) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedEntry) return;

    const section = data.find((day) =>
      day.entries.some((entry) => entry.id === selectedEntry),
    );

    if (section) {
      setOpenItems([section.date]); // open that section
    }
  }, [selectedEntry, data]);

  return (
    <Accordion
      type="multiple"
      className="relative space-y-1"
      value={openItems}
      onValueChange={setOpenItems}
    >
      {data.map((section) => (
        <ExecutionAccordionSection
          key={section.date}
          section={section}
          selectedEntry={selectedEntry}
          onSelect={onSelect}
        />
      ))}
    </Accordion>
  );
}
