import { Command, CommandEmpty, CommandList } from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";

import { ModelVersionDto } from "../../dtos/model-version-dto";
import { MVList } from "./MVList";
import { MVNoContentMessage } from "./MVNoContentMessage";
import { MVSearchBox } from "./MVSearchBox";
import { MVSkeleton } from "./MVSkeleton";

interface FVPopoverContentProps {
  modelVersionsList: ModelVersionDto[] | undefined;
  isLoading: boolean | undefined;
}

/**
 * Renders the content of the versions  component.
 */
export const FVPopoverContent = ({
  modelVersionsList,
  isLoading,
}: FVPopoverContentProps) => {
  // Return the component
  return (
    <Command className="pt-2">
      {/* cmdk input Searchbox */}
      <MVSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <MVNoContentMessage />
      </CommandEmpty>

      {isLoading ? (
        // Load skeleton only when popover opens for the first time
        <MVSkeleton />
      ) : (
        <>
          {/* Versions list */}
          <ScrollArea>
            <CommandList className="mx-2 mb-2 border-none">
              <MVList modelVersionsList={modelVersionsList} />
            </CommandList>
          </ScrollArea>
        </>
      )}
    </Command>
  );
};
