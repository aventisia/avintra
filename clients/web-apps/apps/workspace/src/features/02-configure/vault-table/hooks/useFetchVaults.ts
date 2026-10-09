import { toast } from "@avplatform/ui/sonner";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { getVaults } from "../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Fetches the current-space (personal) and shared-with-user vault credentials
 * concurrently and exposes them as a single merged list.
 * @returns An object containing the merged data, isFetching flag, and isLoading flag.
 */
export const useFetchVaults = () => {
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
        queryFn: () => getVaults({ isPersonal: true }),
      },
      {
        queryKey: [...DATA_QUERY_KEY, "SHARED", space, env],
        queryFn: () => getVaults({ isPersonal: false }),
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

  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch vault credentials");
  }, [error, isError]);

  return {
    data,
    isFetching: results.some((r) => r.isFetching),
    isLoading: results.some((r) => r.isLoading),
  };
};
