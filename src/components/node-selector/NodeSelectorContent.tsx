import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { NodeList } from "./NodeList";
import { NSNoContentMessage } from "./NSNoContentMessage";
import { NodeSelectorOriginType } from "./node-selector-origin-type";
import { TriggerList } from "./TriggerList";

interface NodeSelectorContentProps {
  origin: NodeSelectorOriginType;
}

export const NodeSelectorContent = ({ origin }: NodeSelectorContentProps) => {
  return (
    <Command>
      {/* Searchbox */}
      <CommandInput className="text-xs" placeholder="Search..." />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <NSNoContentMessage />
      </CommandEmpty>

      {/* List of Nodes */}
      <ScrollArea>
        <CommandList className="p-2">
          {origin === "ReplaceTrigger" ? <TriggerList /> : <NodeList />}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
