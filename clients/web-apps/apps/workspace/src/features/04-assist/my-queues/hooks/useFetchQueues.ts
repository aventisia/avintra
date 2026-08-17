import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMyAgentQueues, getMyQueues, getQueues } from "../apis/queues-table-apis";
import { QueueTypesEnum } from "../enums/queue-instance-type-enum";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueues = ({
  onlyUserQueues = true,
  queueType = QueueTypesEnum.User,
  dateRange,
}: {
  onlyUserQueues?: boolean;
  queueType?: QueueTypesEnum;
  dateRange?: { from?: Date; to?: Date };
} = {}) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Get projects using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: onlyUserQueues
      ? [...DATA_QUERY_KEY, currentSpace?.id, queueType, dateRange?.from, dateRange?.to]
      : ["QUEUES", currentSpace?.id],
    queryFn: () => {
      if (onlyUserQueues) {
        return queueType === QueueTypesEnum.Agent
          ? getMyAgentQueues(dateRange)
          : getMyQueues(dateRange);
      }
      return getQueues();
    },
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
