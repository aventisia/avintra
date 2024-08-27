import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Command, CommandEmpty, CommandList } from "cmdk";
import { useFetchFlows } from "../../hooks/useFetchFlows";
import { FPCFlowsList } from "./FPCFlowsList";
import { FPCNoContentMessage } from "./FPCNoContentMessage";
import { FPCSearchBox } from "./FPCSearchBox";
import { FPCSkeleton } from "./FPCSkeleton";

/**
 * Renders the content of the Flows popover component.
 */
export const FlowsPopoverContent = () => {
  // Fetch flows data
  const { data, isLoading } = useFetchFlows();

  // Return the component
  return (
    <Command className="flex h-[calc(100vh-3rem)] flex-col mlg:h-[calc(var(--popover-height)-3rem)]">
      {/* cmdk input Searchbox */}
      <FPCSearchBox />

      {isLoading ? (
        // Load skeleton only when popover opens for the first time
        <FPCSkeleton />
      ) : (
        <>
          {/* No content message */}
          <CommandEmpty className="h-full">
            <FPCNoContentMessage />
          </CommandEmpty>

          {/* Flows list */}
          <ScrollArea className="grow">
            <CommandList className="mx-2.5 mb-2.5 border-none p-1">
              <FPCFlowsList flowsList={data?.data} />
            </CommandList>
          </ScrollArea>
        </>
      )}
    </Command>
  );
};
