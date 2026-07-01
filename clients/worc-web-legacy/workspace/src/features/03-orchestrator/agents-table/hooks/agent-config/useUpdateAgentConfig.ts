import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateFlowVersionSetting } from "../../apis/agent-config-api";
import { DATA_QUERY_KEY } from "../../constants";
import { ExecutionSettings } from "../../dtos/agent-config-dto";

export const useUpdateAgentConfig = () => {
  //  Get the query client for cache management
  const queryClient = useQueryClient();

  // Create a mutation to update flow
  const { mutateAsync: updateFlowSettings, isPending } = useMutation({
    mutationFn: ({
      payload,
      versionId,
    }: {
      versionId: string;
      payload: ExecutionSettings;
    }) => updateFlowVersionSetting({ versionId, payload }),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { updateFlowSettings, isPending };
};
