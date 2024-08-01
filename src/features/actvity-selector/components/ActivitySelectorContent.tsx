import { useAddNode } from "@/hooks/add-node";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useShallow } from "zustand/react/shallow";
import { activitiesList } from "../data/activities-to-select";
import { useActivitySelectorStore } from "../stores/activity-selector-store";
import { ActivityToSelect } from "./activity-to-select";
import { ASNoContentMessage } from "./ASNoContentMessage";

/**
 * Renders the content of the activity selector component.
 * This component displays a search input, a list of activities, and a message when there are no activities.
 */
export const ActivitySelectorContent = () => {
  // Get store state and actions
  const { togglePopoverOrigin } = useActivitySelectorStore(
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
        <ASNoContentMessage />
      </CommandEmpty>

      {/* List of activities */}
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
              {/* activity item */}
              <ActivityToSelect data={item} />
            </CommandItem>
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
