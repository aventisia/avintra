import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { archiveConversation } from "../apis/assist-conversations-apis";

export const useArchiveConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveConversation,

    onSuccess: (response) => {
      toast.success(response.message);

      queryClient.invalidateQueries({ queryKey: ["chat-agents", "active"] });
      queryClient.invalidateQueries({ queryKey: ["chat-agents", "archived"] });
    },

    onError: (error) => {
      toast.error(error?.toString() ?? "Something went wrong.");
    },
  });
};
