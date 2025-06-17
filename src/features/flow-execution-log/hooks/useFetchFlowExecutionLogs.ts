import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@aventisia/ui/sonner";
import { DATA_QUERY_KEY, executions } from "../constants";
import { Execution } from "@/features/flow-execution-log/types/execution-types";
import { useFlowExecutionLogStore } from "../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { getLocalExecutionLog } from "../apis/get-version-execution-log";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

export const useFetchExecutionLogs = () => {
  // Get flow execution store state & actions
  const { showDialog, resetSelections } = useFlowExecutionLogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      resetSelections: state.resetSelections,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { isPublished } = useReactFlowExtStore(
    useShallow((state) => ({
      isPublished: state.isPublished,
    })),
  );

  // Get current flow and execution state from current flow store
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: async (): Promise<Execution[]> => {
      if (!isPublished) {
        // Fetch from local storage if not published
        const localLogs = await getLocalExecutionLog(currentFlow.versionId);
        return localLogs ?? [];
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return executions;
    },
    enabled: showDialog,
  });

  // Refetch every time dialog is opened
  useEffect(() => {
    if (showDialog) {
      refetch();
    }
  }, [showDialog, refetch]);

  useEffect(() => {
    if (data) {
      resetSelections(data);
    }
  }, [data, resetSelections]);

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
