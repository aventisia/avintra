import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getModels } from "../apis/models-table-apis";
import { useModelsTableStore } from "../stores/models-table-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to fetch models using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchModels = () => {
  // Get models store state and actions
  const { modelsQueryKey } = useModelsTableStore(
    useShallow((state) => ({
      modelsQueryKey: state.modelsQueryKey,
    })),
  );
  
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: modelsQueryKey,
    queryFn: () => getModels(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
