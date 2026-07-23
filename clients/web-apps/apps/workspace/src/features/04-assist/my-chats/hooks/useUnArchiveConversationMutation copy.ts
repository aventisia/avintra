import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unarchiveConversation } from "../apis/assist-conversations-apis";

export const useUnArchiveConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveConversation,

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
