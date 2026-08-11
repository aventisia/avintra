import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteNotification } from "../apis/notification-apis";
import { NOTIFICATIONS_QUERY_KEY } from "./useFetchNotifications.hook";

/**
 * Custom hook to delete a notification.
 * On success, it invalidates the notifications query and shows a success toast.
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteNotificationMutation, isPending } = useMutation({
    mutationFn: deleteNotification,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { deleteNotificationMutation, isPending };
};
