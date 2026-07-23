import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  getPublicPendingTemplates,
  getTenantPendingTemplates,
} from "../apis/templates-approval-apis";
import { PTA_QUERY_KEY, TTA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch pending templates based on role (tenant or super admin).
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchPendingTemplates = (isSuperAdmin: boolean) => {
  // Dynamically pick API and query key based on user
  const { queryFn, queryKey } = useMemo(() => {
    if (isSuperAdmin) {
      return {
        queryFn: getPublicPendingTemplates,
        queryKey: PTA_QUERY_KEY,
      };
    }
    return {
      queryFn: getTenantPendingTemplates,
      queryKey: TTA_QUERY_KEY,
    };
  }, [isSuperAdmin]);

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [isError, error]);

  return { data, isFetching, isLoading };
};
