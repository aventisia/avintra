import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getNotificationRoles } from "../apis/notification-apis";

/**
 * Custom hook to fetch the roles available for notification recipient targeting.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchNotificationRoles = () => {
  // Get roles using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["notification-roles-to-select"],
    queryFn: () => getNotificationRoles(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
