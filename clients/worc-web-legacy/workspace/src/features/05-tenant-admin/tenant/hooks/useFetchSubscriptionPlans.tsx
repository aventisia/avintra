import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSubscriptionPlans } from "../apis/subscription-plans-apis";

/**
 * Custom hook to fetch Subscription Plans using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSubscriptionPlans = (query?: string) => {
  // Get credit Subscription Plans using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["SUBSCRIPTION_PLANS", query],
    queryFn: () => getSubscriptionPlans(query),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
