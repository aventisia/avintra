import { useMemo } from "react";

import { QueueTypesEnum } from "../enums/queue-instance-type-enum";
import { TabValue, WorkItemRow } from "../types/my-queue-types";
import { filterByTabStatus } from "../utils/my-queue-utils";
import { useFetchQueues } from "./useFetchQueues";
import { useFetchQueuesWorkItems } from "./useFetchQueuesWorkItems";

export const useMyQueueData = (
  queueId: string | null,
  tabValue: TabValue,
  dateRange?: { from?: Date; to?: Date },
  queueType: QueueTypesEnum = QueueTypesEnum.User,
) => {
  const { data: queuesRes } = useFetchQueues({ onlyUserQueues: true, queueType });
  const { data: workItemsRes } = useFetchQueuesWorkItems(queueId ?? "");

  const inputSchema = useMemo(() => {
    return queuesRes?.data.find((q) => q.id === queueId)?.inputSchema ?? [];
  }, [queuesRes?.data, queueId]);

  const customStatuses = useMemo(() => {
    return queuesRes?.data.find((q) => q.id === queueId)?.statuses ?? [];
  }, [queuesRes?.data, queueId]);

  const tableData = useMemo<WorkItemRow[]>(() => {
    return (
      workItemsRes?.data
        ?.filter((item) => filterByTabStatus(tabValue, item.status))
        // For the History tab, apply the optional date range (defaults to today).
        ?.filter((item) => {
          if (tabValue !== "History") return true;
          if (!dateRange?.from && !dateRange?.to) return true;

          const completedOn = item.lastModifiedOn
            ? new Date(item.lastModifiedOn)
            : item.createdOn
              ? new Date(item.createdOn)
              : undefined;
          if (!completedOn) return true;

          if (dateRange.from && completedOn < startOfDay(dateRange.from)) return false;
          if (dateRange.to && completedOn > endOfDay(dateRange.to)) return false;
          return true;
        })
        ?.map((item) => ({
          rowId: item.id,
          status: item.status,
          assignee: item.assignee,
          createdOn: item.createdOn ? new Date(item.createdOn).toISOString() : undefined,
          lastModifiedOn: item.lastModifiedOn
            ? new Date(item.lastModifiedOn).toISOString()
            : undefined,
          closedOn: item.lastModifiedOn ? new Date(item.lastModifiedOn).toISOString() : undefined,
          ...(item?.workItemData ? JSON.parse(item?.workItemData) : {}),
        })) ?? []
    );
  }, [workItemsRes?.data, tabValue, dateRange?.from, dateRange?.to]);

  return {
    queues: queuesRes?.data ?? [],
    inputSchema,
    customStatuses,
    tableData,
  };
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
