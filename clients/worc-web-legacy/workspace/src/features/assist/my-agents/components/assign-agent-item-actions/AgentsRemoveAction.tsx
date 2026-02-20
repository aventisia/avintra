import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

import { useRemoveAssignedAgentsMutation } from "../../hooks/useRemoveAssignedAgentsMutation";

interface AgentsRemoveActionProps {
  agentId: string;
}

/**
 * Renders the remove action for a agents list item.
 * This component displays a dropdown menu item with a remove button.
 */
export const AgentsRemoveAction = ({ agentId }: AgentsRemoveActionProps) => {
  const { osID: machineId } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );

  const { mutate: removeAgents } = useRemoveAssignedAgentsMutation();
  // Return Remove alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        removeAgents({ agentIds: [agentId], machineId });
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
