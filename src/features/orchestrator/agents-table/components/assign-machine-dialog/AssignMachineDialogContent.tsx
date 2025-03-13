import { useQueryClient } from "@tanstack/react-query";
import { DATA_QUERY_KEY } from "../../constants";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { MachineCheckList } from "./MachineCheckList";
import { useAssignMachineStore } from "../../stores/assign-machine-store";
import { AgentsTableDto } from "../../dtos/agents-table-dto";
import { AgentDetails } from "./AgentDetails";

export const AssignMachineDialogContent = () => {
  // Get query client
  const queryClient = useQueryClient();

  const { agentId } = useAssignMachineStore(
    useShallow((state) => ({
      agentId: state.agentId,
    })),
  );

  // Get agents data from query client
  const agentsData = queryClient.getQueryData<{
    data: AgentsTableDto[];
  }>(DATA_QUERY_KEY);

  // Get machine data by id
  const agentData = agentsData?.data.find((item) => item.id === agentId);

  useEffect(() => {
    console.log(agentData);
  }, [agentId, agentData, agentsData?.data]);

  // Return the form
  return (
    <>
      <AgentDetails {...agentData} />
      <MachineCheckList
        assignedCount={agentData?.machineCount ?? 0}
        agentName={agentData?.name ?? ""}
      />
    </>
  );
};
