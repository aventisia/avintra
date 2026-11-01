import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getUnreadNotifications } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { UN_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

/** Polls the user's unread notifications to keep the unread count fresh. */
export const useFetchUnreadNotifications = () => {
  const setUnreadCount = useUnreadNotificationsStore((state) => state.setUnreadCount);

  // IMPORTANT NOTE: polls in the background because other users send notifications while this client stays open.
  const { data, isError, error } = useQuery({
    queryKey: UN_QUERY_KEY,
    queryFn: getUnreadNotifications,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  useEffect(() => {
    if (data) setUnreadCount(data.data.length);
  }, [data, setUnreadCount]);
};
