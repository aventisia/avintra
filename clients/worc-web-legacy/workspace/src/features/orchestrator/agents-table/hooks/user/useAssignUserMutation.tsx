import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertChatAgentUser } from "../../apis/chat-agents-users-apis";
import { CHAT_AGENT_USER_KEY } from "../../constants";
import { useAgentUsersStore } from "../../stores/agent-users-store";

export const useAssignUserMutation = () => {
  // // Get the query client
  const queryClient = useQueryClient();

  const { flowVersionId } = useAgentUsersStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
    })),
  );

  return useMutation({
    mutationFn: insertChatAgentUser,

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_AGENT_USER_KEY, flowVersionId],
      });
      toast.success("Assigned User(s) successfully.");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
