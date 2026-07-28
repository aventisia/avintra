import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getUnreadNotifications } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { UN_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

/**
 * Hook to fetch unread notifications for the user
 * @returns isFetching and isLoading status
 */
export const useFetchUnreadNotifications = () => {
  // Get store state and actions
  const { isOpen, setUnreadCount } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setUnreadCount: state.setUnreadCount,
    })),
  );

  // Get unread notifications using react query
  const { data, isFetching, isLoading, refetch, isError, error } = useQuery({
    queryKey: UN_QUERY_KEY,
    queryFn: getUnreadNotifications,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Set unread notifications count
  useEffect(() => {
    if (data) setUnreadCount(data?.data.length);
  }, [data, setUnreadCount]);

  // Refetch unread notifications on dialog open
  useEffect(() => {
    if (isOpen) {
      // Refetch unread notifications
      refetch();
    }
  }, [isOpen, refetch]);

  // Return the fetching and loading status
  return { isFetching, isLoading };
};
