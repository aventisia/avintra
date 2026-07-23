import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { assignMachines } from "../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { AgentAssignMachineDto } from "../dtos/agent-assign-machine-dto";
import { useAssignMachineStore } from "../stores/assign-machine-store";

export const useAssignMachineMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { flowVersionId, setView } = useAssignMachineStore(
    useShallow((s) => ({
      setView: s.setView,
      flowVersionId: s.flowVersionId,
    })),
  );

  return useMutation({
    // API call to assign machines to the agent version
    mutationFn: async (originalData: AgentAssignMachineDto) => {
      return assignMachines({
        flowVersionId: originalData.flowVersionId,
        machineIds: originalData.machineIds,
      });
    },

    // Show error toast if the mutation fails
    onError: (error) => {
      toast.error(error.toString());
    },
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({
        queryKey: ["machines-to-select", flowVersionId],
      });
      queryClient.invalidateQueries({
        queryKey: DATA_QUERY_KEY,
      });
      setView("Machines");
    },
  });
};
