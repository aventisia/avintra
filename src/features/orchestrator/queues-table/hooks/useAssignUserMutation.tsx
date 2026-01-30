import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertQueueUser } from "../apis/queue-users-apis";
import { QUEUE_USER_KEY } from "../constants";
import { useQueueUsersStore } from "../stores/queue-users-store";

export const useAssignUserMutation = () => {
  // // Get the query client
  const queryClient = useQueryClient();

  const { queueId } = useQueueUsersStore(
    useShallow((s) => ({
      queueId: s.queueId,
    })),
  );

  return useMutation({
    mutationFn: insertQueueUser,

    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_USER_KEY, queueId] });
      toast.success("Assigned User(s) successfully.");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
