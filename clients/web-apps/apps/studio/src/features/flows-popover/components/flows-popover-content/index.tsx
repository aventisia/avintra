import { Command, CommandEmpty, CommandList } from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
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
    <Command>
      {/* cmdk input Searchbox */}
      <FPCSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <FPCNoContentMessage />
      </CommandEmpty>

      {isLoading ? (
        // Load skeleton only when popover opens for the first time
        <FPCSkeleton />
      ) : (
        <>
          {/* Flows list */}
          <ScrollArea>
            <CommandList className="mx-2.5 mb-2.5 border-none p-1">
              <FPCFlowsList flowsList={data?.data} />
            </CommandList>
          </ScrollArea>
        </>
      )}
    </Command>
  );
};
