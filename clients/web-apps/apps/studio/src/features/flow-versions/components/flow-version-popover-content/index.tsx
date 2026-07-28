import { Command, CommandEmpty, CommandList } from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { FVList } from "./FVList";
import { FVNoContentMessage } from "./FVNoContentMessage";
import { FVSearchBox } from "./FVSearchBox";
import { FVSkeleton } from "./FVSkeleton";
import { FlowVersionDto } from "../../dtos/flow-version-dto";

interface FVPopoverContentProps {
  flowVersionsList: FlowVersionDto[] | undefined;
  isLoading: boolean | undefined;
}

/**
 * Renders the content of the Flow versions  component.
 */
export const FVPopoverContent = ({
  flowVersionsList,
  isLoading,
}: FVPopoverContentProps) => {
  // Return the component
  return (
    <Command className="pt-2">
      {/* cmdk input Searchbox */}
      <FVSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <FVNoContentMessage />
      </CommandEmpty>

      {isLoading ? (
        // Load skeleton only when popover opens for the first time
        <FVSkeleton />
      ) : (
        <>
          {/* Flows list */}
          <ScrollArea>
            <CommandList className="mx-2 mb-2 border-none">
              <FVList flowVersionsList={flowVersionsList} />
            </CommandList>
          </ScrollArea>
        </>
      )}
    </Command>
  );
};
