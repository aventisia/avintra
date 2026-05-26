import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateQueueAgent } from "../apis/queue-agents-apis";
import { QUEUE_AGENT_KEY } from "../constants";
import { useQueueAgentsStore } from "../stores/queue-agents-store";

export const useUpdateAgentMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { queueId } = useQueueAgentsStore(
    useShallow((s) => ({
      queueId: s.queueId,
    })),
  );

  return useMutation({
    mutationFn: updateQueueAgent,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_AGENT_KEY, queueId] });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
