import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { UserMinus2Icon } from "lucide-react";

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
        "group h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        removeAgent(agentId);
      }}
    >
      <UserMinus2Icon
        className={cn("mb-[2px] text-destructive group-focus:text-white", "h-3.5 w-3.5")}
      />
      Remove
    </DropdownMenuItem>
  );
};
