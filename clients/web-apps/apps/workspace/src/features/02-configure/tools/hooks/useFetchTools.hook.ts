import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getLibraryTools, getTools } from "../apis/tools.apis";
import { DATA_QUERY_KEY } from "../constants/tools-table.constants";
import { useTableTab } from "./useTableTab.hook";

/**
 * Fetches tools for the active tab.
 *
 * The default ("all") view merges the current-space (personal) and shared-with-user
 * lists into one table; the library tab shows platform tools.
 */
export const useFetchTools = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);
  const space = currentSpace?.id ?? "";

  const { isLibrary } = useTableTab();

  const personalQuery = useQuery({
    queryKey: [...DATA_QUERY_KEY, space, env],
    queryFn: () => getTools({ isPersonal: true }),
    enabled: !isLibrary,
  });

  const sharedQuery = useQuery({
    queryKey: [...DATA_QUERY_KEY, "SHARED", space, env],
    queryFn: () => getTools({ isPersonal: false }),
    enabled: !isLibrary,
  });

  const libraryQuery = useQuery({
    queryKey: [...DATA_QUERY_KEY, "LIBRARY", space, env],
    queryFn: () => getLibraryTools(),
    enabled: isLibrary,
  });

  const activeQueries = isLibrary ? [libraryQuery] : [personalQuery, sharedQuery];

  const isError = personalQuery.isError || sharedQuery.isError || libraryQuery.isError;
  const error = personalQuery.error || sharedQuery.error || libraryQuery.error;

  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch tools");
  }, [error, isError]);

  // Merge the active lists into a single table payload. Return undefined until at
  // least one list has resolved so callers can show a loading skeleton.
  //
  // Memoized on the underlying query data so the returned object/array keeps a
  // stable identity between renders. Passing a fresh array on every render makes
  // TanStack Table's `autoResetPageIndex` fire a state update each render, which
  // causes an infinite render loop (page freeze) while a dialog is open.
  const data = useMemo(() => {
    if (isLibrary) return libraryQuery.data;

    if (!personalQuery.data && !sharedQuery.data) return undefined;
    return {
      ...personalQuery.data,
      data: [...(personalQuery.data?.data ?? []), ...(sharedQuery.data?.data ?? [])],
    };
  }, [isLibrary, personalQuery.data, sharedQuery.data, libraryQuery.data]);

  return {
    data,
    isFetching: activeQueries.some((query) => query.isFetching),
    isLoading: activeQueries.some((query) => query.isLoading),
    isError,
  };
};
