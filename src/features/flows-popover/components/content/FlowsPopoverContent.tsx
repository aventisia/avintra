import {
  FPCNoContentMessage,
  FPCSearchBox,
  FPCSkeleton,
  useFetchFlows,
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  ScrollArea,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";

/**
 * Renders the content of the Flows popover component.
 */
export const FlowsPopoverContent = () => {
  // Get store state and actions
  const { togglePopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Fetch flows data
  const { data, isLoading } = useFetchFlows();

  // Return the component
  return (
    <>
      {/* Load skeleton only when popover opens for the first time */}
      {isLoading ? (
        <FPCSkeleton />
      ) : (
        <Command>
          {/* cmdk input Searchbox */}
          <FPCSearchBox />

          {/* No content message */}
          <CommandEmpty className="h-full">
            <FPCNoContentMessage />
          </CommandEmpty>

          {/* List of flows */}
          <ScrollArea>
            <CommandList className="border-none p-2">
              {data?.data.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    togglePopoverOpen(false);
                  }}
                  className="rounded-lg p-1"
                >
                  {/* flow item */}
                  {item.name}
                </CommandItem>
              ))}
            </CommandList>
          </ScrollArea>
        </Command>
      )}
    </>
  );
};
