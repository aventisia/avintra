import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationAsRead } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import {
  NOTIFICATION_HISTORY_QUERY_KEY,
  UN_QUERY_KEY,
} from "@/react-toolkit/features/unread-notifications/constants/constants";

/** Marks one notification read by its notification id, then refreshes the lists and the count. */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (response) => {
      if (!response.data) toast.error(response.message);
    },
    onError: (error) => toast.error(error.toString()),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: UN_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_HISTORY_QUERY_KEY }),
      ]),
  });
};
