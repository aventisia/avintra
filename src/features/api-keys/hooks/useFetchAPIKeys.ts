import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getAPIKeysList } from "../apis/api-keys-api";

/**
 * Custom hook to fetch api keys using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchApiKeys = () => {
  // Get modelId (mid) from query params
  const { modelId: mlModelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || mlModelId || "";

  // Get models using react query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["api-keys", modelId],
    queryFn: () => getAPIKeysList(modelId),
  });

  // Return data and refetch
  return { data, refetch, isLoading };
};
