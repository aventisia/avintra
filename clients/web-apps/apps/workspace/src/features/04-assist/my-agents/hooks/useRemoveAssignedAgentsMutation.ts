import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DUMMY_MACHINE_ID } from "@/constants/machine-identity";

import { removeAgents } from "../apis/agents-assist-apis";

export const useRemoveAssignedAgentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAgents,

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Machine updated successfully.", {
        className: "sonner-toaster-sm",
      });

      queryClient.invalidateQueries({ queryKey: ["agents-assist", DUMMY_MACHINE_ID] });
    },

    onError: (error) => {
      toast.error(error?.toString() ?? "Something went wrong.");
    },
  });
};
