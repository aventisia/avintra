import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { TrashIcon } from "@phosphor-icons/react";

import { useRemoveAssignedAgentsMutation } from "../../hooks/useRemoveAssignedAgentsMutation";

interface AgentsRemoveActionProps {
  agentId: string;
  machineIds: string[];
}

/**
 * Renders the remove action for a agents list item.
 * This component displays a dropdown menu item with a remove button.
 */
export const AgentsRemoveAction = ({ agentId, machineIds }: AgentsRemoveActionProps) => {
  const { mutate: removeAgents } = useRemoveAssignedAgentsMutation();
  // Return Remove alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "group h-8")}
      onClick={() => {
        removeAgents({ agentId, machineIds });
      }}
    >
      <TrashIcon className={cn("mb-[2px] text-bad", "h-4 w-4")} />
      Remove
    </DropdownMenuItem>
  );
};
