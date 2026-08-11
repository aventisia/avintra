import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  type NotificationHistoryParams,
  getNotificationHistory,
} from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { NOTIFICATION_HISTORY_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

/**
 * Hook to fetch the notification history for the user with optional filters.
 * @param params - Optional filter params (type, isRead, from, to)
 * @returns data, isFetching and isLoading status
 */
export const useFetchNotificationHistory = (params?: NotificationHistoryParams) => {
  // Get store state and actions
  const { isOpen } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
    })),
  );

  // Get notification history using react query
  const { data, isFetching, isLoading, refetch, isError, error } = useQuery({
    queryKey: [...NOTIFICATION_HISTORY_QUERY_KEY, params],
    queryFn: () => getNotificationHistory(params),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Refetch notification history on dialog open
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Return the fetching and loading status
  return { data, isFetching, isLoading };
};
