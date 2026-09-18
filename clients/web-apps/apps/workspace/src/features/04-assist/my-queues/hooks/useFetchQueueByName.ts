import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getQueueByName } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Fetches a single queue by name, including its complete input schema.
 *
 * The my-queues list endpoints strip array-typed fields (e.g. `line_items`) from
 * the input schema, so the work item form must resolve the schema from this
 * endpoint instead of the list payload.
 */
export const useFetchQueueByName = (queueName?: string | null) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DATA_QUERY_KEY, "by-name", currentSpace?.id, queueName],
    queryFn: () => getQueueByName(queueName ?? ""),
    enabled: !!queueName,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
