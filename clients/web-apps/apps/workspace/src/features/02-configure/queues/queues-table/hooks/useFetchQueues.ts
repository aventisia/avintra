import { toast } from "@avplatform/ui/sonner";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getQueues } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Fetches the current-space (personal) and shared-with-user queues concurrently and
 * exposes them as a single merged list.
 */
const useMergedQueues = () => {
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
        queryKey: [...DATA_QUERY_KEY, space, env],
        queryFn: () => getQueues({ isPersonal: true }),
      },
      {
        queryKey: [...DATA_QUERY_KEY, "SHARED", space, env],
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
    isError: results.some((r) => r.isError),
    error: results.find((r) => r.error)?.error,
  };
};

/**
 * Custom hook to fetch the merged queue list for the queues table.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueues = () => {
  // Get the merged personal + shared queues using react query
  const { data, isFetching, isLoading, isError, error } = useMergedQueues();

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch queues");
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};

/**
 * Fetches both the personal and the shared queue lists and exposes them as a
 * single merged list.
 *
 * Used by the work item screens, which resolve a queue against the merged list so
 * the originating tab is no longer required.
 */
export const useFetchAllQueues = () => {
  const { data, isFetching, isLoading } = useMergedQueues();

  return { data, isFetching, isLoading };
};
