import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getBillingHistory } from "../apis/billing-history-apis.ee";
import { BILLING_HISOTRY_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch models using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchBillingHistory = () => {
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: BILLING_HISOTRY_QUERY_KEY,
    queryFn: () => getBillingHistory(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
