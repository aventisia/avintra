import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getLibrarySkills, getSkills } from "../apis/skill-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch skills using react query.
 *
 * The default view loads the merged personal + shared list from a single
 * endpoint; the library tab shows platform skills.
 *
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkills = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);
  const space = currentSpace?.id ?? "";

  const { isLibrary } = useTableTab();

  // Stable, distinct keys. The list key holds the merged personal + shared payload
  // (single endpoint); the library key holds platform skills. Both include the
  // current space and env and share the DATA_QUERY_KEY prefix so a single
  // invalidation refetches them together.
  const listQueryKey = [...DATA_QUERY_KEY, space, env];
  const libraryQueryKey = [...DATA_QUERY_KEY, "LIBRARY", space, env];

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => getSkills(),
    enabled: !isLibrary,
  });

  const libraryQuery = useQuery({
    queryKey: libraryQueryKey,
    queryFn: () => getLibrarySkills(),
    enabled: isLibrary,
  });

  const isError = listQuery.isError || libraryQuery.isError;
  const error = listQuery.error || libraryQuery.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch skills");
  }, [error, isError]);

  const activeQuery = isLibrary ? libraryQuery : listQuery;

  // Return isFetching and isLoading flag
  return {
    data: activeQuery.data,
    isError,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
  };
};
