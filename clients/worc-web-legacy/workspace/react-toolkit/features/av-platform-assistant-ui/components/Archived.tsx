import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { unarchiveConversation } from "../apis/assist-conversations-apis";

export default function Archived() {
  const { conversationId } = useParams();

  const useUnArchiveConversationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: unarchiveConversation,

      onSuccess: (response) => {
        toast.success(response.message);

        queryClient.invalidateQueries({ queryKey: ["chat-agents", "active"] });
        queryClient.invalidateQueries({
          queryKey: ["chat-agents", "archived"],
        });
      },

      onError: (error) => {
        toast.error(error?.toString() ?? "Something went wrong.");
      },
    });
  };

  const { mutate } = useUnArchiveConversationMutation();
  return (
    <div className="flex flex-col gap-2 w-full items-center justify-center rounded-lg border  bg-muted px-4 py-3 text-muted-foreground text-sm">
      <p className="text-sm  font-medium">This chat has been archived</p>
      <Button
        variant={"link"}
        onClick={() => {
          if (conversationId) mutate(conversationId);
        }}
      >
        Restore chat
      </Button>
    </div>
  );
}
