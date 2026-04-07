import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { insertConversation } from "../apis/assist-conversations-apis";

export const useInsertConversationMutation = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  return useMutation({
    mutationFn: insertConversation,

    onSuccess: (response) => {
      navigate(
        `/assist/chats/${response.data.flowVersionId}/${response.data.id}`,
      );

      queryClient.invalidateQueries({ queryKey: ["chat-agents", "active"] });
    },

    onError: (error) => {
      toast.error(error?.toString() ?? "Something went wrong.");
    },
  });
};
