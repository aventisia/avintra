import { CommandEmpty } from "@aventisia/ui/command";
import { NoContentMessage } from "@/react-toolkit/ui/custom/NoContentMessage";
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
