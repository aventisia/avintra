import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getLibrarySkills, getSkills } from "../apis/skill-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch skills using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkills = (tab: "current" | "all" = "current") => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared/Library tabs list
  const { isPersonal, isShared, isLibrary, queryKey } = useTableTab();

  const shouldFetchBoth = tab === "all";

  // When fetching both lists (e.g. detail page lookup), use stable distinct keys
  // so the queries never collide. For the current tab view, use the tab-derived key.
  const personalQueryKey = shouldFetchBoth ? DATA_QUERY_KEY : queryKey;
  const sharedQueryKey = [...DATA_QUERY_KEY, "SHARED"];
  const libraryQueryKey = [...DATA_QUERY_KEY, "LIBRARY"];

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
