import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getLibraryTools, getTools } from "../apis/tools.apis";
import { DATA_QUERY_KEY } from "../constants/tools-table.constants";
import { useTableTab } from "./useTableTab.hook";

/**
 * Fetches tools for the current tab (personal, shared, or library).
 */
export const useFetchTools = () => {
  const { currentTab, isPersonal, isShared, isLibrary, queryKey } = useTableTab();

  const personalQuery = useQuery({
    queryKey,
    queryFn: () => getTools({ isPersonal: true }),
    enabled: isPersonal,
  });

  const sharedQuery = useQuery({
    queryKey: [...DATA_QUERY_KEY, "SHARED"],
    queryFn: () => getTools({ isPersonal: false }),
    enabled: isShared,
  });

  const libraryQuery = useQuery({
    queryKey: [...DATA_QUERY_KEY, "LIBRARY"],
    queryFn: () => getLibraryTools(),
    enabled: isLibrary,
  });

  const activeQuery = isPersonal ? personalQuery : isShared ? sharedQuery : libraryQuery;

  const isError = personalQuery.isError || sharedQuery.isError || libraryQuery.isError;
  const error = personalQuery.error || sharedQuery.error || libraryQuery.error;

  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch tools");
  }, [error, isError]);

  return {
    data: activeQuery.data,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
    isError,
    currentTab,
  };
};
