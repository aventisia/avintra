import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getJobById } from "../apis/jobs-table-apis";

/**
 * Custom hook to fetch job details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchJobDetails = (id?: string) => {
  // Get jobs using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["jobs-details", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
