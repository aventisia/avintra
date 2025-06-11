import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@aventisia/ui/sonner";
import { DATA_QUERY_KEY, executions } from "../constants";
import { Execution } from "@/features/flow-execution-log/types/execution-types";
import { useFlowExecutionLogStore } from "../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";

export const useFetchExecutionLogs = () => {
  // Get flow execution store state & actions
  const { resetSelections } = useFlowExecutionLogStore(
    useShallow((state) => ({
      resetSelections: state.resetSelections,
    })),
  );

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: async (): Promise<Execution[]> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return executions;
    },
  });

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
