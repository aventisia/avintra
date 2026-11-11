import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSaNotifications } from "../apis/sa-notification-apis.ee";

const SA_NOTIFICATIONS_QUERY_KEY = ["sa-notifications"];

/**
 * Fetches the list of Super Admin notifications.
 * Returns the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSaNotifications = () => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: SA_NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getSaNotifications(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};

export { SA_NOTIFICATIONS_QUERY_KEY };
