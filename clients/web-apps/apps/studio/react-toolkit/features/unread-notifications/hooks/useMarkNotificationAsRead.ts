import { useOptimisticMutation } from "@avplatform/ui/hooks";
import { useQueryData } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { markNotificationAsRead } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { UN_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

/**
 * Custom hook to mark a notification as read.
 *
 * @param id - The ID of the notification to mark as read.
 * @returns An object containing the mutation function and a flag indicating if the mutation is pending.
 */
export const useMarkNotificationAsRead = (id: string) => {
  // Get store state and actions
  const { setUnreadCount } = useUnreadNotificationsStore(
    useShallow((state) => ({
      setUnreadCount: state.setUnreadCount,
    })),
  );

  // Get unread notifications from query client
  const unreadNotifications = useQueryData<UnreadNotificationDto>(UN_QUERY_KEY);

  // Filter out the notification that is being marked as read
  const updatedQueryData = unreadNotifications?.filter(
    (item) => item.id !== id,
  );

  // Use optimistic mutation to mark notification as read
  const { mutate } = useOptimisticMutation<
    string,
    boolean,
    UnreadNotificationDto
  >(markNotificationAsRead, UN_QUERY_KEY, updatedQueryData, false);

  // Handle mark as read mutate
  const handleMutateMarkAsRead = () => {
    // Set unread flag
    if (updatedQueryData) setUnreadCount(updatedQueryData?.length);

    // mutate the notification as read
    mutate(id);
  };

  // Return mark as read handler
  return { handleMutateMarkAsRead };
};
