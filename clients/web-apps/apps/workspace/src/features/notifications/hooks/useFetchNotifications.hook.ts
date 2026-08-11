import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getNotifications } from "../apis/notification-apis";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

/**
 * Fetches the list of notifications.
 * Returns the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchNotifications = () => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getNotifications(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};

export { NOTIFICATIONS_QUERY_KEY };
