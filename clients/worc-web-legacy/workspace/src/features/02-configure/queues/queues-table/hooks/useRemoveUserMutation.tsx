import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deleteQueueUser } from "../apis/queue-users-apis";
import { QUEUE_USER_KEY } from "../constants";
import { useQueueUsersStore } from "../stores/queue-users-store";

export const useRemoveUserMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { queueId } = useQueueUsersStore(
    useShallow((s) => ({
      queueId: s.queueId,
    })),
  );

  return useMutation({
    mutationFn: deleteQueueUser,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_USER_KEY, queueId] });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
