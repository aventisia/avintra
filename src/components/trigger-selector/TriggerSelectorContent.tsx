import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { TriggerNodeList } from "./TriggerNodeList";
import { TSNoContentMessage } from "./TSNoContentMessage";

export const TriggerSelectorContent = () => {
  return (
    <Command>
      {/* Searchbox */}
      <CommandInput className="text-xs" placeholder="Search trigger..." />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <TSNoContentMessage />
      </CommandEmpty>

      {/* List of Trigger nodes */}
      <ScrollArea>
        <CommandList className="p-2">
          <TriggerNodeList />
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
