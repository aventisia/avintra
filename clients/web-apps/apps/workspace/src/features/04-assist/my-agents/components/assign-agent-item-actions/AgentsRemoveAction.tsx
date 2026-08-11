import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";

import { DUMMY_MACHINE_ID } from "@/constants/machine-identity";

import { useRemoveAssignedAgentsMutation } from "../../hooks/useRemoveAssignedAgentsMutation";

interface AgentsRemoveActionProps {
  agentId: string;
}

/**
 * Renders the remove action for a agents list item.
 * This component displays a dropdown menu item with a remove button.
 */
export const AgentsRemoveAction = ({ agentId }: AgentsRemoveActionProps) => {
  const { mutate: removeAgents } = useRemoveAssignedAgentsMutation();
  // Return Remove alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "group h-8")}
      onClick={() => {
        removeAgents({ agentIds: [agentId], machineId: DUMMY_MACHINE_ID });
      }}
    >
      <TrashIcon className={cn("mb-[2px] text-destructive group-focus:text-white", "h-4 w-4")} />
      Remove
    </DropdownMenuItem>
  );
};
