import { AccordionContent, AccordionItem, AccordionTrigger } from "@avplatform/ui/accordion";
import { ChevronDown } from "lucide-react";

import { DaySection } from "../../types/log-list-type";
import ExecutionLogAccordionItem from "./ExecutionLogAccordionItem";

interface Props {
  section: DaySection;
  selectedEntry: string;
  onSelect: (id: string) => void;
}

export default function ExecutionAccordionSection({ section, selectedEntry, onSelect }: Props) {
  return (
    <AccordionItem key={section.date} value={section.date} className="border-none">
      <AccordionTrigger className="group flex h-8 w-full items-center justify-start gap-2 px-4 py-0 text-label uppercase text-muted-foreground hover:bg-hover hover:no-underline [&>svg]:hidden">
        <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
        <span className="font-mono">{section.date}</span>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        {section.entries.map((entry) => (
          <ExecutionLogAccordionItem
            key={entry.id}
            entry={entry}
            isSelected={entry.id === selectedEntry}
            onClick={onSelect}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
