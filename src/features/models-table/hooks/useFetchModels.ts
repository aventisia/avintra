import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getProjectModels } from "../apis/models-table-apis";
import { useModelsTableStore } from "../stores/models-table-store";

/**
 * Custom hook to fetch associated models with project using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchModels = () => {
  // Get models store state and actions
  const { projectId, modelsQueryKey } = useModelsTableStore(
    useShallow((state) => ({
      projectId: state.projectId,
      modelsQueryKey: state.modelsQueryKey,
    })),
  );
  
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: modelsQueryKey,
    queryFn: () => getProjectModels(projectId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
