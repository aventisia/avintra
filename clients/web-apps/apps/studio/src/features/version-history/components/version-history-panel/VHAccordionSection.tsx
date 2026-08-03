import { AccordionContent, AccordionItem, AccordionTrigger } from "@avplatform/ui/accordion";
import { ChevronDown } from "lucide-react";

import { DaySection } from "../../types/agent-history-type";
import VHAccordionItem from "./VHAccordionItem";

interface Props {
  section: DaySection;
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function VHAccordionSection({ section, selectedEntry, onSelect }: Props) {
  return (
    <AccordionItem key={section.date} value={section.date} className="border-none">
      {/* Date Header */}
      <AccordionTrigger className="group relative flex w-full items-center justify-start gap-3 rounded-lg py-2 [&>svg]:hidden">
        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
          <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
        <span className="text-md font-medium">{section.date}</span>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        {/* Timeline Container */}
        <div className="relative ml-4 space-y-0">
          {/* Timeline Entries */}
          {section.entries.map((entry) => (
            <VHAccordionItem
              key={entry.id}
              entry={entry}
              isSelected={entry.id === selectedEntry}
              onClick={onSelect}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
