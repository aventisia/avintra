import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import {
  getQueueWorkItemEventsById,
  insertQueueWorkItemEvent,
} from "../apis/queues-transaction-event-apis";
import { DATA_QUERY_KEY, EVENT_QUERY_KEY } from "../constants";

export const useFetchQueueWorkItemEvents = (workItemId?: string) => {
  return useQuery({
    queryKey: [EVENT_QUERY_KEY, workItemId],
    queryFn: () => getQueueWorkItemEventsById(workItemId!),
    enabled: !!workItemId,
    select: (res) => res.data,
  });
};

export const useInsertQueueWorkItemEvent = () => {
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  const queueId = searchParams.get("qid");
  const workItemId = searchParams.get("wid");

  return useMutation({
    mutationFn: insertQueueWorkItemEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, queueId],
      });
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, workItemId],
      });

      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEY, workItemId],
      });
    },
  });
};
