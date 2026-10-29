import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createSaNotification } from "../apis/sa-notification-apis.ee";
import { SA_NOTIFICATIONS_QUERY_KEY } from "./useFetchSaNotifications.hook.ee";

/**
 * Custom hook to create a Super Admin notification.
 * On success, it invalidates the sa-notifications query and shows a success toast. On error, it shows an error toast.
 */
export const useCreateSaNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: createSaNotificationMutation, isPending } = useMutation({
    mutationFn: createSaNotification,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: SA_NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { createSaNotificationMutation, isPending };
};
