import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../../../constants";
import { MachinesTableDto } from "../../../dtos/machines-table-dto";
import { SelectAgentTableDto } from "../../../dtos/select-agent-table-dto";
import { useUpdateMachineAgentsMutation } from "../../../hooks/useUpdateMachineAgentsMutation";
import { useAssignAgentsStore } from "../../../stores/assign-agents-store";

interface MachinesDeleteActionProps {
  agentId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const AgentsDeleteAction = ({ agentId }: MachinesDeleteActionProps) => {
  const { mutate: updateAgents } = useUpdateMachineAgentsMutation();

  const queryClient = useQueryClient();

  const { machineId } = useAssignAgentsStore((state) => ({
    machineId: state.machineId,
  }));

  const handleRemoveAgent = () => {
    const agentData = queryClient.getQueryData<{ data: SelectAgentTableDto[] }>(
      ["select-agent", machineId],
    );
    const currentAgentIds =
      agentData?.data.filter((a) => a.isAssigned).map((a) => a.id) ?? [];

    const updatedAgentIds = currentAgentIds.filter((id) => id !== agentId);

    const machineData = queryClient
      .getQueryData<{ data: MachinesTableDto[] }>(DATA_QUERY_KEY)
      ?.data.find((m) => m.id === machineId);

    if (machineData) {
      updateAgents({ ...machineData, agentIds: updatedAgentIds });
    }
  };

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        handleRemoveAgent();
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
