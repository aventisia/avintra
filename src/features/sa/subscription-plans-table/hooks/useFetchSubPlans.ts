import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSubPlans } from "../apis/sub-plans-table-apis";
import { PLANS_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch Subscription Plans using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSubPlans = () => {
  // Get Pro plans using react query
  const {
    data: proPlanData,
    isLoading: isProLoading,
    isError: isProError,
    error: proError,
  } = useQuery({
    queryKey: [...PLANS_QUERY_KEY, "Pro"],
    queryFn: () => getSubPlans("Pro"),
  });

  // Get Enterprise plans using react query
  const {
    data: enterprisePlanData,
    isLoading: isEnterpriseLoading,
    isError: isEnterpriseError,
    error: enterpriseError,
  } = useQuery({
    queryKey: [...PLANS_QUERY_KEY, "Enterprise"],
    queryFn: () => getSubPlans("Enterprise"),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isProError) toast.error(proError.toString());
    if (isEnterpriseError) toast.error(enterpriseError.toString());
  }, [enterpriseError, isEnterpriseError, isProError, proError]);

  // Combine both plans data, make sure to handle undefined
  const data = [
    ...(proPlanData?.data || []),
    ...(enterprisePlanData?.data || []),
  ];

  // Combine loading state (both must be false for isLoading to be false)
  const isLoading = isProLoading || isEnterpriseLoading;

  // Return combined data and isLoading flag
  return { data: data, isLoading };
};
