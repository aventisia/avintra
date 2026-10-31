import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Trash2Icon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useRemoveMachineMutation } from "../../../hooks/useRemoveMachineMutation";
import { useAssignMachineStore } from "../../../stores/assign-machine-store";

interface MachinesDeleteActionProps {
  id: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const MachinesDeleteAction = ({ id }: MachinesDeleteActionProps) => {
  const { flowVersionId } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      setMachineIds: s.setMachineIds,
    })),
  );

  const { mutate } = useRemoveMachineMutation();

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "group h-8")}
      onClick={() => {
        mutate({ flowVersionId, machineIds: [id] });
      }}
    >
      <Trash2Icon className="mb-[2px] h-4 w-4" />
      Remove
    </DropdownMenuItem>
  );
};
