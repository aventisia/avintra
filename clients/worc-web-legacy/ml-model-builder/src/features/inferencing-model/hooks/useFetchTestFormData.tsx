import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { getInferenceModelExtractedDataById } from "../apis/inference-mode-test-apis";

/**
 * Custom hook to fetch model using react query.
 * @returns An object containing the fetched data, error, and refetch method.
 */
export const useFetchTestFormData = () => {
  // Get versionId (mid) from store
  const { versionId } = useLabelDataStore(
    useShallow((state) => ({
      versionId: state.versionId,
    })),
  );

  // Get models using react query
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["INFERENCE_TEST_FORM_DATA"],
    queryFn: () => getInferenceModelExtractedDataById(versionId),
    enabled: !!versionId, // prevents query from running with empty versionId
    staleTime: 0, // ✅ Treat data as immediately stale
  });

  // // Show toast on fetch error
  // useEffect(() => {
  //   if (isError && error) {
  //     toast.error(
  //       `Failed to fetch setup form data: ${error.message || error.toString()}`,
  //     );
  //   }
  // }, [isError, error]);

  return { data, refetch, isLoading, isError };
};
