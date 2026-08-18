import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getLibrarySkills, getSkills } from "../apis/skill-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch skills using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkills = (tab: "current" | "all" = "current") => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared/Library tabs list
  // queryKey already includes the current space id.
  const { isPersonal, isShared, isLibrary, queryKey } = useTableTab();

  const shouldFetchBoth = tab === "all";

  // When fetching both lists (e.g. detail page lookup), use stable distinct keys
  // so the queries never collide. For the current tab view, use the tab-derived key.
  // All keys include the current space id to match mutation invalidation.
  const personalQueryKey = shouldFetchBoth
    ? [...DATA_QUERY_KEY, currentSpace?.id ?? ""]
    : queryKey;
  const sharedQueryKey = [...DATA_QUERY_KEY, "SHARED", currentSpace?.id ?? ""];
  const libraryQueryKey = [...DATA_QUERY_KEY, "LIBRARY", currentSpace?.id ?? ""];

  // Get skills using react query
  const personalQuery = useQuery({
    queryKey: personalQueryKey,
    queryFn: () => getSkills({ isPersonal: true }),
    enabled: shouldFetchBoth || isPersonal,
  });

  const sharedQuery = useQuery({
    queryKey: sharedQueryKey,
    queryFn: () => getSkills({ isPersonal: false }),
    enabled: shouldFetchBoth || isShared,
  });

  const libraryQuery = useQuery({
    queryKey: libraryQueryKey,
    queryFn: () => getLibrarySkills(),
    enabled: isLibrary,
  });

  const isError = personalQuery.isError || sharedQuery.isError || libraryQuery.isError;
  const error = personalQuery.error || sharedQuery.error || libraryQuery.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch skills");
  }, [error, isError]);

  const activeQuery = isPersonal ? personalQuery : isShared ? sharedQuery : libraryQuery;

  const data = shouldFetchBoth
    ? {
        ...personalQuery.data,
        data: [
          ...(personalQuery.data?.data ?? []),
          ...(sharedQuery.data?.data ?? []),
          ...(libraryQuery.data?.data ?? []),
        ],
      }
    : activeQuery.data;

  // Return isFetching and isLoading flag
  return {
    data,
    isError,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
  };
};
