import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateChatAgentUser } from "../../apis/chat-agents-users-apis";
import { CHAT_AGENT_USER_KEY } from "../../constants";
import { useAgentUsersStore } from "../../stores/agent-users-store";

export const useUpdateUserMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { flowVersionId } = useAgentUsersStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
    })),
  );

  return useMutation({
    mutationFn: updateChatAgentUser,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_AGENT_USER_KEY, flowVersionId],
      });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
