import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getVaults } from "../apis/vaults-table-apis";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch configs using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchVaults = () => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  // queryKey already includes the current space id.
  const { isPersonal, queryKey } = useTableTab();

  // Get configs using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => getVaults({ isPersonal }),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
