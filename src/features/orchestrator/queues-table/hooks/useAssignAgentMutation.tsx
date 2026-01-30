import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertQueueAgent } from "../apis/queue-agents-apis";
import { QUEUE_AGENT_KEY } from "../constants";
import { useQueueAgentsStore } from "../stores/queue-agents-store";

export const useAssignAgentMutation = () => {
  // // Get the query client
  const queryClient = useQueryClient();

  const { queueId } = useQueueAgentsStore(
    useShallow((s) => ({
      queueId: s.queueId,
    })),
  );

  return useMutation({
    mutationFn: insertQueueAgent,

    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_AGENT_KEY, queueId] });
      toast.success("Assigned Agent(s) successfully.");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
