import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getMachineAgents, getNewMachineAgents } from "../apis/machines-table-apis";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSelectAgents = () => {

  // Get crud dialog store state
  const {
    crudDialogOptions: { rowId: machhineId, crudAction },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["select-agent", crudAction === "create" ? "" : machhineId],
    queryFn: () => crudAction === "create" ? getNewMachineAgents() : getMachineAgents(machhineId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
