import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getPublishedUis } from "../apis/published-uis-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Fetches the published custom UI builder projects for the current space.
 */
export const useFetchPublishedUis = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...DATA_QUERY_KEY, currentSpace?.id, "uis"],
    queryFn: () => getPublishedUis(),
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading, refetch };
};
