import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSkills } from "../apis/skill-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch skills using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkills = (tab: "current" | "all" = "current") => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey } = useTableTab();

  const shouldFetchBoth = tab === "all";

  // When fetching both lists (e.g. detail page lookup), use stable distinct keys
  // so the two queries never collide. For the current tab view, use the tab-derived key.
  const personalQueryKey = shouldFetchBoth ? DATA_QUERY_KEY : queryKey;
  const sharedQueryKey = [...DATA_QUERY_KEY, "SHARED"];

  // Get skills using react query
  const personalQuery = useQuery({
    queryKey: personalQueryKey,
    queryFn: () => getSkills({ isPersonal: true }),
    enabled: shouldFetchBoth || isPersonal,
  });

  const sharedQuery = useQuery({
    queryKey: sharedQueryKey,
    queryFn: () => getSkills({ isPersonal: false }),
    enabled: shouldFetchBoth || !isPersonal,
  });

  const isError = personalQuery.isError || sharedQuery.isError;
  const error = personalQuery.error || sharedQuery.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch skills");
  }, [error, isError]);

  const data = shouldFetchBoth
    ? {
        ...personalQuery.data,
        data: [...(personalQuery.data?.data ?? []), ...(sharedQuery.data?.data ?? [])],
      }
    : personalQuery.data || sharedQuery.data;

  // Return isFetching and isLoading flag
  return {
    data,
    isError,
    isFetching: personalQuery.isFetching || sharedQuery.isFetching,
    isLoading: personalQuery.isLoading || sharedQuery.isLoading,
  };
};
