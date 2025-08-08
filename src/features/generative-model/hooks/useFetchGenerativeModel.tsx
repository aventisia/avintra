import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { getGenerativeModelDataById } from "../apis/generative-model-setup-apis";

/**
 * Custom hook to fetch generative model using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchGenerativeModel = () => {
  // Get modelId (mid) from query params
  const location = useLocation();
  const { data: modelData } = useFetchModel();
  const queryParams = new URLSearchParams(location.search);
  const modelId = modelData?.data?.id || queryParams.get("mid") || "";

  // Get models using react query
  const {
    data,
    // isError, error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["GENERATIVE_SETUP_FORM_DATA"],
    queryFn: () => getGenerativeModelDataById(modelId),
    enabled: !!modelId, // Optional: prevent query if modelId is empty
  });

  // Show toast on fetch error
  // useEffect(() => {
  //   if (isError) toast.error(error.toString());
  // }, [error, isError]);

  // Return data and refetch
  return { data, refetch, isLoading };
};
