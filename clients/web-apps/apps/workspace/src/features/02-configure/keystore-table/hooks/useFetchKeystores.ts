import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getKeystore } from "../apis/keystores-table-apis";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch keystores using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchKeystores = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey } = useTableTab();

  // Get keystores using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...queryKey, currentSpace?.id],
    queryFn: () => getKeystore({ isPersonal }),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
