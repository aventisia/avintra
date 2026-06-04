import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getResourceShareById } from "../apis/resource-share-apis";
import { RESOURCE_USER_KEY } from "../constant";

/**
 * Custom hook to fetch Resource users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchResourceShare = (resourceId: string) => {
  // Get users using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [RESOURCE_USER_KEY, resourceId],
    queryFn: () => getResourceShareById(resourceId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
