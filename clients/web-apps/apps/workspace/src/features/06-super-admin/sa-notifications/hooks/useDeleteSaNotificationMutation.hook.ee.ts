import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSaNotification } from "../apis/sa-notification-apis.ee";
import { SA_NOTIFICATIONS_QUERY_KEY } from "./useFetchSaNotifications.hook.ee";

/**
 * Custom hook to delete a Super Admin notification.
 * On success, it invalidates the sa-notifications query and shows a success toast.
 */
export const useDeleteSaNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteSaNotificationMutation, isPending } = useMutation({
    mutationFn: deleteSaNotification,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: SA_NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { deleteSaNotificationMutation, isPending };
};
