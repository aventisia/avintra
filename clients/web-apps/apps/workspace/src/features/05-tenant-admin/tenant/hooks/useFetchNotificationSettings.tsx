import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getNotificationSettings } from "../apis/tenant-info-apis";

/**
 * Custom hook to fetch the tenant's automatic notification settings using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchNotificationSettings = () => {
  // Get notification settings using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["TENANT_NOTIFICATION_SETTINGS"],
    queryFn: getNotificationSettings,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
