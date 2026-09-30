import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getLibrarySkills, getSkills } from "../apis/skill-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch skills using react query.
 *
 * The default ("current") view merges the current-space (personal) and
 * shared-with-user lists into one table; the library tab shows platform skills.
 * Passing "all" fetches every list, which is used by detail-page lookups.
 *
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkills = (tab: "current" | "all" = "current") => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);
  const space = currentSpace?.id ?? "";

  const { isLibrary } = useTableTab();

  const shouldFetchBoth = tab === "all";

  // Stable, distinct keys per list. All keys include the current space id and share
  // the DATA_QUERY_KEY prefix so a single invalidation refetches every list.
  const personalQueryKey = [...DATA_QUERY_KEY, space, env];
  const sharedQueryKey = [...DATA_QUERY_KEY, "SHARED", space, env];
  const libraryQueryKey = [...DATA_QUERY_KEY, "LIBRARY", space, env];

  const personalQuery = useQuery({
    queryKey: personalQueryKey,
    queryFn: () => getSkills({ isPersonal: true }),
    enabled: shouldFetchBoth || !isLibrary,
  });

  const sharedQuery = useQuery({
    queryKey: sharedQueryKey,
    queryFn: () => getSkills({ isPersonal: false }),
    enabled: shouldFetchBoth || !isLibrary,
  });

  const libraryQuery = useQuery({
    queryKey: libraryQueryKey,
    queryFn: () => getLibrarySkills(),
    enabled: shouldFetchBoth || isLibrary,
  });

  const isError = personalQuery.isError || sharedQuery.isError || libraryQuery.isError;
  const error = personalQuery.error || sharedQuery.error || libraryQuery.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch skills");
  }, [error, isError]);

  const activeQueries = shouldFetchBoth
    ? [personalQuery, sharedQuery, libraryQuery]
    : isLibrary
      ? [libraryQuery]
      : [personalQuery, sharedQuery];

  // Merge the active lists into a single table payload. Return undefined until at
  // least one list has resolved so callers can show a loading skeleton.
  //
  // Memoized on the underlying query data so the returned object/array keeps a
  // stable identity between renders. Passing a fresh array on every render makes
  // TanStack Table's `autoResetPageIndex` fire a state update each render, which
  // causes an infinite render loop (page freeze) while a dialog is open.
  const data = useMemo(() => {
    if (shouldFetchBoth) {
      if (!personalQuery.data && !sharedQuery.data && !libraryQuery.data) return undefined;
      return {
        ...personalQuery.data,
        data: [
          ...(personalQuery.data?.data ?? []),
          ...(sharedQuery.data?.data ?? []),
          ...(libraryQuery.data?.data ?? []),
        ],
      };
    }

    if (isLibrary) return libraryQuery.data;

    if (!personalQuery.data && !sharedQuery.data) return undefined;
    return {
      ...personalQuery.data,
      data: [...(personalQuery.data?.data ?? []), ...(sharedQuery.data?.data ?? [])],
    };
  }, [shouldFetchBoth, isLibrary, personalQuery.data, sharedQuery.data, libraryQuery.data]);

  // Return isFetching and isLoading flag
  return {
    data,
    isError,
    isFetching: activeQueries.some((query) => query.isFetching),
    isLoading: activeQueries.some((query) => query.isLoading),
  };
};
