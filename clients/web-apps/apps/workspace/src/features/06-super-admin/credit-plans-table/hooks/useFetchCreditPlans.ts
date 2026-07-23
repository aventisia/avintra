import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getCreditPlans } from "../apis/credit-plans-table-apis";
import { CREDIT_PLANS_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch models using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchCreditPlans = () => {
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: CREDIT_PLANS_QUERY_KEY,
    queryFn: () => getCreditPlans(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
