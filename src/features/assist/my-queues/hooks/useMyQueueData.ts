import { useMemo } from "react";

import { TabValue, WorkItemRow } from "../types/my-queue-types";
import { filterByTabStatus } from "../utils/my-queue-utils";

import { useFetchQueues } from "./useFetchQueues";
import { useFetchQueuesWorkItems } from "./useFetchQueuesWorkItems";

export const useMyQueueData = (queueId: string | null, tabValue: TabValue) => {
  const { data: queuesRes } = useFetchQueues();
  const { data: workItemsRes } = useFetchQueuesWorkItems(queueId ?? "");

  const inputSchema = useMemo(() => {
    return queuesRes?.data.find((q) => q.id === queueId)?.inputSchema ?? [];
  }, [queuesRes?.data, queueId]);

  const tableData = useMemo<WorkItemRow[]>(() => {
    return (
      workItemsRes?.data
        ?.filter((item) => filterByTabStatus(tabValue, item.status))
        ?.map((item) => ({
          rowId: item.id,
          status: item.status,
          ...(item.payloadData ? JSON.parse(item.payloadData) : {}),
        })) ?? []
    );
  }, [workItemsRes?.data, tabValue]);

  return {
    queues: queuesRes?.data ?? [],
    inputSchema,
    tableData,
  };
};
