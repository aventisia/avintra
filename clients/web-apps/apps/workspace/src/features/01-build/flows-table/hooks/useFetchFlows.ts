import { toast } from "@avplatform/ui/sonner";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getFlows } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../constants";

/**
 * Fetches the current-space (personal) and shared-with-user agents concurrently and
 * exposes them as a single merged list, including archived agents.
 * @returns An object containing the merged data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );
  const space = currentSpace?.id ?? "";

  const results = useQueries({
    queries: [
      {
        queryKey: [...FLOWS_QUERY_KEY, space],
        queryFn: () => getFlows({ isPersonal: true, includeArchived: true }),
      },
      {
        queryKey: [...FLOWS_QUERY_KEY, "SHARED", space],
        queryFn: () => getFlows({ isPersonal: false, includeArchived: true }),
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

  const isError = results.some((r) => r.isError);
  const error = results.find((r) => r.error)?.error;

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch agents");
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return {
    data,
    isFetching: results.some((r) => r.isFetching),
    isLoading: results.some((r) => r.isLoading),
  };
};
