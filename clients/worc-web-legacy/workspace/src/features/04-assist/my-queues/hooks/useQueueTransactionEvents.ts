import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getQueueWorkItemEventsById,
  insertQueueWorkItemEvent,
} from "../apis/queues-transaction-event-apis";

const QUERY_KEY = "queue-work-item-events";

export const useFetchQueueWorkItemEvents = (workItemId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, workItemId],
    queryFn: () => getQueueWorkItemEventsById(workItemId!),
    enabled: !!workItemId,
    select: (res) => res.data,
  });
};

export const useInsertQueueWorkItemEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertQueueWorkItemEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.queueTransactionId],
      });
    },
  });
};
