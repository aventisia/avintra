import { getModel } from "@/features/model-library-table/apis/model-library-table-apis";

import { useQuery } from "@tanstack/react-query";
//import { useEffect } from "react";
//import { toast } from "@aventisia/ui/sonner";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to fetch model using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchModel = () => {
  // Get modelId (mid) from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || "";

  // Get models using react query
  const {
    data,
    // isError, error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["model", modelId],
    queryFn: () => getModel(modelId),
  });

  // Show toast on fetch error
  // useEffect(() => {
  //   if (isError) toast.error(error.toString());
  // }, [error, isError]);

  // Return data and refetch
  return { data, refetch, isLoading };
};
