import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateNotification } from "../apis/notification-apis";
import { CreateNotificationDto } from "../dtos/create-notification.dto";
import { NOTIFICATIONS_QUERY_KEY } from "./useFetchNotifications.hook";

/**
 * Custom hook to update an existing notification.
 * On success, it invalidates the notifications query and shows a success toast.
 */
export const useUpdateNotificationMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: updateNotificationMutation, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateNotificationDto }) =>
      updateNotification(id, payload),

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { updateNotificationMutation, isPending };
};
