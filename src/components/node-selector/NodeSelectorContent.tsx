import { activitiesList } from "@/data/activities-list";
import { triggersList } from "@/data/triggers-list";
import { useAddNode } from "@/hooks/add-node";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { useShallow } from "zustand/react/shallow";
import { NodeToSelect } from "./node-to-select";
import { NSNoContentMessage } from "./NSNoContentMessage";

/**
 * Renders the content of the node selector component.
 * This component displays a search input, a list of nodes, and a message when there are no nodes.
 */
export const NodeSelectorContent = () => {
  // Get store state and actions
  const { togglePopoverOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      togglePopoverOrigin: state.togglePopoverOrigin,
    })),
  );

  // Get addNode handler
  const addNodeHandler = useAddNode();

  // Return the component
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
          {activitiesList.map((item, index) => (
            <CommandItem
              key={index}
              value={item.label}
              onSelect={() => {
                addNodeHandler(item);
                togglePopoverOrigin("Closed");
              }}
              className="rounded-lg p-1"
            >
              {/* Node item */}
              <NodeToSelect data={item} />
            </CommandItem>
          ))}
          {triggersList.map((item, index) => (
            <CommandItem
              key={index}
              value={item.label}
              onSelect={() => {
                addNodeHandler(item);
                togglePopoverOrigin("Closed");
              }}
              className="rounded-lg p-1"
            >
              {/* Node item */}
              <NodeToSelect data={item} />
            </CommandItem>
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
