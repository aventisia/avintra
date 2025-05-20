import { toast } from "@aventisia/ui/sonner";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  getMachineAgents,
  getNewMachineAgents,
} from "../apis/machines-table-apis";

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSelectTableAgents = (machhineId: string) => {
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
    queryKey: ["select-agent", crudAction === "create" ? "" : machhineId],
    queryFn: () =>
      crudAction === "create"
        ? getNewMachineAgents()
        : getMachineAgents(machhineId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
