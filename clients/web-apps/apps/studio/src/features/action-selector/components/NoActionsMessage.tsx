import { NoContentMessage } from "@avplatform/ui";
import { CommandEmpty } from "@avplatform/ui/command";
import { TextSearch } from "lucide-react";

/**
 * Renders a message to display when no actions are found.
 */
export const NoActionsMessage = () => {
  return (
    <CommandEmpty className="h-full">
      <NoContentMessage
        className="-mt-5"
        Icon={TextSearch}
        primaryMessage="No actions found"
        secondaryMessage="Try adjusting your search or filter criteria"
      />
    </CommandEmpty>
  );
};
