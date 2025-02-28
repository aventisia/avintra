import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { DATA_QUERY_KEY } from "../constants";
import { getMachines } from "../apis/machine-apis";

/**
 * Custom hook to fetch machines using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchMachines = () => {
  // Get machines using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getMachines(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
