import {
  FPCNoContentMessage,
  FPCSearchBox,
  FPCSkeleton,
  FPCFlowsList,
  useFetchFlows,
} from "@/features/flows-popover";
import {
  Command,
  CommandEmpty,
  CommandList,
  ScrollArea,
} from "@/react-toolkit/components/ui";

/**
 * Renders the content of the Flows popover component.
 */
export const FlowsPopoverContent = () => {
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

          {/* Flows list */}
          <ScrollArea>
            <CommandList className="mx-2.5 my-1 mb-2.5 border-none p-1">
              <FPCFlowsList flowsList={data?.data} />
            </CommandList>
          </ScrollArea>
        </Command>
      )}
    </>
  );
};
