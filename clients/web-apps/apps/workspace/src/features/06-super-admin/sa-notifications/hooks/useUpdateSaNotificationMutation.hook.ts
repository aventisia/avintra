import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSaNotification } from "../apis/sa-notification-apis";
import { CreateSaNotificationDto } from "../dtos/create-sa-notification.dto";
import { SA_NOTIFICATIONS_QUERY_KEY } from "./useFetchSaNotifications.hook";

/**
 * Custom hook to update an existing Super Admin notification.
 * On success, it invalidates the sa-notifications query and shows a success toast.
 */
export const useUpdateSaNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: updateSaNotificationMutation, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateSaNotificationDto }) =>
      updateSaNotification(id, payload),

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: SA_NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { updateSaNotificationMutation, isPending };
};
