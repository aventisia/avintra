import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { syncMachineFlowVersions } from "../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useAssignAgentsStore } from "../stores/assign-agents-store";

export const useUpdateMachineAgentsMutation = () => {
  const queryClient = useQueryClient();

  const { machineId } = useAssignAgentsStore((state) => ({
    machineId: state.machineId,
  }));

  return useMutation({
    mutationFn: syncMachineFlowVersions,

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Machine updated successfully.", {
        className: "sonner-toaster-sm",
      });

      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["select-agent", machineId] });
    },

    onError: (error) => {
      toast.error(error?.toString() ?? "Something went wrong.");
    },
  });
};
