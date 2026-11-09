import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignMachines } from "../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Replaces the machines assigned to an agent version with the given set.
 */
export const useAssignMachineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignMachines,
    onError: (error) => {
      toast.error(error.toString());
    },
    onSuccess: (httpResponse, { flowVersionId }) => {
      toast.success(httpResponse?.message, { className: "sonner-toaster-sm" });
      queryClient.invalidateQueries({ queryKey: ["machines-to-select", flowVersionId] });
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    },
  });
};
