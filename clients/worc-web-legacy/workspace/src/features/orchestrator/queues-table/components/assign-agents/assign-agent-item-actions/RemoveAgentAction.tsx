import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useRemoveAgentMutation } from "../../../hooks/useRemoveAgentMutation";

interface RemoveAgentActionProps {
  agentId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const RemoveAgentAction = ({ agentId }: RemoveAgentActionProps) => {
  const { mutate: removeAgent } = useRemoveAgentMutation();

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        removeAgent(agentId);
      }}
    >
      <TrashIcon
        className={cn(
          "mb-[2px] text-destructive group-focus:text-white",
          "h-4 w-4",
        )}
      />
      Remove
    </DropdownMenuItem>
  );
};
