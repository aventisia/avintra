import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getExtractedDataList } from "../apis/extraction-data--table-apis";

/**
 * Custom hook to fetch extracted data using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useGetExtractedDataList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get modelId (mid) form query params
  const modelId = queryParams.get("pid") || "";

  // Get data using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["extracted", modelId],
    queryFn: () => getExtractedDataList(modelId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
