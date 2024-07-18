import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  ScrollArea,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { ActivityToSelect } from "./activity-to-select/ActivityToSelect";
import { ASNoContentMessage } from "./ASNoContentMessage";
import { useActivitySelectorStore } from "../stores/activity-selector-store";
import { activitiesList } from "../data/activities-to-select";

/**
 * Renders the content of the activity selector component.
 * This component displays a search input, a list of activities, and a message when there are no activities.
 */
export const ActivitySelectorContent = () => {
  // Get store state and actions
  const { togglePopoverOpen } = useActivitySelectorStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

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
                togglePopoverOpen(false);
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
