import { useFetchAgents } from "../../hooks/useFetchAgents";
import { useQueryClient } from "@tanstack/react-query";
import { DATA_QUERY_KEY } from "../../constants";
import type { MachineDto } from "../../dtos/machine-dto";
import { useMachineAgentStore } from "../../store/machine-agent-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { MachineDetails } from "./MachineDetails";
import { AgentsCheckList } from "./AgentsCheckList";
import { Separator } from "@/react-toolkit/ui/separator";

export const MachineAssignAgent = () => {
  const { data } = useFetchAgents();
  // Get query client
  const queryClient = useQueryClient();

  const { machineId } = useMachineAgentStore(
    useShallow((state) => ({
      machineId: state.machineId,
    })),
  );
  console.log(data);

  // Get machines data from query client
  const machinesData = queryClient.getQueryData<{
    data: MachineDto[];
  }>(DATA_QUERY_KEY);

  // Get machine data by id
  const machineData = machinesData?.data.find((item) => item.id === machineId);

  useEffect(() => {
    console.log(machineData);
  }, [machineId, machineData, machinesData?.data]);

  // Return the form
  return (
    <>
      <MachineDetails {...machineData} />
      <Separator className="my-2" />
      <AgentsCheckList
        assignedCount={machineData?.agentCount ?? 0}
        machineName={machineData?.name ?? ""}
      />
    </>
  );
};
