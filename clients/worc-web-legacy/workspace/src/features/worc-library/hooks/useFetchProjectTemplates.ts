import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAgentTemplates } from "../apis/wroc-templates-apis";

/**
 * Custom hook to fetch templates using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchProjectTemplates = () => {
  // Get templates using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["PROJECT_TEMPLATES"],
    queryFn: () => getAgentTemplates(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
