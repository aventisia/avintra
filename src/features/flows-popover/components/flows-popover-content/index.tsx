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
    <>
      {/* Load skeleton only when popover opens for the first time */}
      {isLoading ? (
        <FPCSkeleton />
      ) : (
        <Command className="flex flex-col h-[calc(100vh-3rem)] mlg:h-[calc(var(--popover-height)-3rem)]">
          {/* cmdk input Searchbox */}
          <FPCSearchBox />

          {/* No content message */}
          <CommandEmpty className="h-full">
            <FPCNoContentMessage />
          </CommandEmpty>

          {/* Flows list */}
          <ScrollArea className="grow">
            <CommandList className="mx-1.5 my-1.5 mb-1.5 border-none p-1">
              <FPCFlowsList flowsList={data?.data} />
            </CommandList>
          </ScrollArea>
        </Command>
      )}
    </>
  );
};
