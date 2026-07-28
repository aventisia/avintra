import { Accordion } from "@avplatform/ui/accordion";
import VHAccordionSection from "./VHAccordionSection";
import { DaySection } from "../../types/agent-history-type";
import { useEffect, useState } from "react";

interface Props {
  data: DaySection[];
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function VersionHistoryAccordion({
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
        <VHAccordionSection
          key={section.date}
          section={section}
          selectedEntry={selectedEntry}
          onSelect={onSelect}
        />
      ))}
    </Accordion>
  );
}
