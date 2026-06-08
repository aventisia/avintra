import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getArchivedAgents } from "../apis/archived-flows-table-apis";
import { ARCHIVED_FLOWS_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch Archived flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchArchivedFlows = ({
  isPersonal,
}: {
  isPersonal: boolean;
}) => {
  // Get Archived flows using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: isPersonal
      ? [ARCHIVED_FLOWS_QUERY_KEY, "PERSONAL"]
      : ARCHIVED_FLOWS_QUERY_KEY,
    queryFn: () => getArchivedAgents({ isPersonal }),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
