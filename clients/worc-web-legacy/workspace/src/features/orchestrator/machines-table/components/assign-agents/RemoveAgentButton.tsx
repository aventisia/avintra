import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableDto } from "../../dtos/machines-table-dto";
import { SelectAgentTableDto } from "../../dtos/select-agent-table-dto";
import { useUpdateMachineAgentsMutation } from "../../hooks/useUpdateMachineAgentsMutation";
import { useAssignAgentsStore } from "../../stores/assign-agents-store";

export const RemoveAgentButton = ({ agentId }: { agentId: string }) => {
  const [currDel, setCurrDel] = useState<string | null>(null);
  const { mutate: updateAgents, isPending } = useUpdateMachineAgentsMutation();
  const queryClient = useQueryClient();
  const { machineId } = useAssignAgentsStore((state) => ({
    machineId: state.machineId,
  }));

  const handleRemoveAgent = () => {
    setCurrDel(agentId);

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

  return (
    <Button
      onClick={handleRemoveAgent}
      variant="caution"
      size="icon7"
      disabled={isPending && currDel === agentId}
    >
      {isPending && currDel === agentId ? (
        <LoadingSpinner className="h-4 w-4" />
      ) : (
        <Trash2Icon className="h-4 w-4" />
      )}
    </Button>
  );
};
