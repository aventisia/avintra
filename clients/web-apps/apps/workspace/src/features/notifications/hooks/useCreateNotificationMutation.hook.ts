import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification } from "../apis/notification-apis";
import { NOTIFICATIONS_QUERY_KEY } from "./useFetchNotifications.hook";

/**
 * Custom hook to create a notification.
 * On success, it invalidates the notifications query and shows a success toast. On error, it shows an error toast.
 */
export const useCreateNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: createNotificationMutation, isPending } = useMutation({
    mutationFn: createNotification,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { createNotificationMutation, isPending };
};
