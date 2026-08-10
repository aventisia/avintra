import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMyQueues, getQueues } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueues = ({ onlyUserQueues = true }: { onlyUserQueues?: boolean }) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Get projects using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: onlyUserQueues ? [...DATA_QUERY_KEY, currentSpace?.id] : ["QUEUES", currentSpace?.id],
    queryFn: () => (onlyUserQueues ? getMyQueues() : getQueues()),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
