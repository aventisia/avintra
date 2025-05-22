import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getClassificationSetupFormDataById } from "../apis/classification-model-setup-apis";

/**
 * Custom hook to fetch model using react query.
 * @returns An object containing the fetched data, error, and refetch method.
 */
export const useFetchSetupFormData = () => {
  // Get modelId (mid) from store
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  // Get models using react query
  const { data, isError, error, refetch, isLoading } = useQuery({
    queryKey: ["CLASSIFICATION_SETUP_FORM_DATA"],
    queryFn: () => getClassificationSetupFormDataById(modelId),
    enabled: !!modelId, // prevents query from running with empty modelId
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError && error) {
      toast.error(
        `Failed to fetch setup form data: ${error.message || error.toString()}`,
      );
    }
  }, [isError, error]);

  return { data, refetch, isLoading, isError };
};
