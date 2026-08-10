import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSpaceOptions } from "../apis/space-options-apis";

const SPACE_OPTIONS_QUERY_KEY = ["space-options"];

/**
 * Custom hook to fetch space options using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSpaceOptions = () => {
  // Get space options using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: SPACE_OPTIONS_QUERY_KEY,
    queryFn: () => getSpaceOptions(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
