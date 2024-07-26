import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { getProjectFlows } from "../apis/flows-table-apis";
import { useFlowsTableStore } from "../stores/flows-table-store";

/**
 * Custom hook to fetch associated flows with project using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Get flows store state and actions
  const { projectId, flowsQueryKey } = useFlowsTableStore(
    useShallow((state) => ({
      projectId: state.projectId,
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

  // Get flows using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: flowsQueryKey,
    queryFn: () => getProjectFlows(projectId),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
