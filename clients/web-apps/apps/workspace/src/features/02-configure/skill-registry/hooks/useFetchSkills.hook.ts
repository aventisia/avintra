import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getPlatformSkills, getSkills } from "../apis/skill-registry.apis";
import { DATA_QUERY_KEY } from "../constants";
import { useTableTab } from "./useTableTab.hook";

/**
 * Custom hook to fetch skills using react query.
 *
 * The default view loads the merged personal + shared list from a single
 * endpoint; the platform default tab shows platform skills.
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

  const { isPlatformTab } = useTableTab();

  // Stable, distinct keys. The list key holds the merged personal + shared payload
  // (single endpoint); the platform key holds platform skills. Both include the
  // current space and env and share the DATA_QUERY_KEY prefix so a single
  // invalidation refetches them together.
  const listQueryKey = [...DATA_QUERY_KEY, space, env];
  const platformQueryKey = [...DATA_QUERY_KEY, "PLATFORM", space, env];

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => getSkills(),
    enabled: !isPlatformTab,
  });

  const platformQuery = useQuery({
    queryKey: platformQueryKey,
    queryFn: () => getPlatformSkills(),
    enabled: isPlatformTab,
  });

  const isError = listQuery.isError || platformQuery.isError;
  const error = listQuery.error || platformQuery.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch skills");
  }, [error, isError]);

  const activeQuery = isPlatformTab ? platformQuery : listQuery;

  // Return isFetching and isLoading flag
  return {
    data: activeQuery.data,
    isError,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
  };
};
