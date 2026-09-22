import { toast } from "@avplatform/ui/sonner";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getQueues } from "../apis/queues-table-apis";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueues = () => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  // queryKey already includes the current space id.
  const { isPersonal, queryKey } = useTableTab();
  // Get projects using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => getQueues({ isPersonal }),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};

/**
 * Fetches both the personal and the shared queue lists and exposes them as a
 * single merged list.
 *
 * Used by the work item screens, which can be reached from either the Personal
 * or the Shared tab: the originating tab is not part of the work-item routes,
 * so the queue must be resolved against both lists instead of only the active
 * tab's list.
 */
export const useFetchAllQueues = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );
  const env = useEnvironmentStore((state) => state.env);
  const space = currentSpace?.id ?? "";

  const results = useQueries({
    queries: [
      {
        queryKey: ["queues", space, env],
        queryFn: () => getQueues({ isPersonal: true }),
      },
      {
        queryKey: ["queues", "SHARED", space, env],
        queryFn: () => getQueues({ isPersonal: false }),
      },
    ],
  });

  const [personal, shared] = results;

  const data = useMemo(() => {
    const [personalData, sharedData] = [personal?.data, shared?.data];
    if (!personalData && !sharedData) return undefined;
    return {
      statusCode: Math.max(personalData?.statusCode ?? 0, sharedData?.statusCode ?? 0),
      message: "",
      data: [...(personalData?.data ?? []), ...(sharedData?.data ?? [])],
    };
  }, [personal?.data, shared?.data]);

  return {
    data,
    isFetching: results.some((r) => r.isFetching),
    isLoading: results.some((r) => r.isLoading),
  };
};
