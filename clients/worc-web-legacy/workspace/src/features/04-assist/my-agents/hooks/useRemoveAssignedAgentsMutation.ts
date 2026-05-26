import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

import { removeAgents } from "../apis/agents-assist-apis";

export const useRemoveAssignedAgentsMutation = () => {
  const queryClient = useQueryClient();

  const { osID: machineId } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );

  return useMutation({
    mutationFn: removeAgents,

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Machine updated successfully.", {
        className: "sonner-toaster-sm",
      });

      queryClient.invalidateQueries({ queryKey: ["agents-assist", machineId] });
    },

    onError: (error) => {
      toast.error(error?.toString() ?? "Something went wrong.");
    },
  });
};
