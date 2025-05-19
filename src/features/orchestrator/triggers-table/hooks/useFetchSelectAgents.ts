import { toast } from "@aventisia/ui/sonner"
import { useDTCrudDialogStore } from "@aventisia/ui/stores"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"

import {
  getNewTriggerAgents,
  geTriggerAgents,
} from "../apis/triggers-table-apis"

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSelectTableAgents = (id: string) => {
  // Get crud dialog store state
  const {
    crudDialogOptions: { crudAction },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["select-trigger-agent", crudAction === "create" ? "" : id],
    queryFn: () =>
      crudAction === "create" ? getNewTriggerAgents() : geTriggerAgents(id),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
