import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getDataFields } from "../apis/add-fields-apis";
import { useModelDataStore } from "@/features/label-data/stores/model-data-store";
import { useShallow } from "zustand/react/shallow";
/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchDataFields = () => {
  // Get model data store state and actions
  const { modelId, labelDataQueryKey } = useModelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
      labelDataQueryKey: state.labelDataQueryKey,
    })),
  );
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: labelDataQueryKey,
    queryFn: () => getDataFields(modelId),
  });
  useEffect(() => {}, [modelId]);
  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
