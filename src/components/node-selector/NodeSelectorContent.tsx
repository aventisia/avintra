import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { ActivityNodeList } from "./ActivityNodeList";
import { NSNoContentMessage } from "./NSNoContentMessage";

/**
 * Renders the content of the node selector component.
 * This component displays a search input, a list of nodes, and a message when there are no nodes.
 */
export const NodeSelectorContent = () => {
  return (
    <Command>
      {/* Searchbox */}
      <CommandInput className="text-xs" placeholder="Search activity..." />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <NSNoContentMessage />
      </CommandEmpty>

      {/* List of Nodes */}
      <ScrollArea>
        <CommandList className="p-2">
          <ActivityNodeList />
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
