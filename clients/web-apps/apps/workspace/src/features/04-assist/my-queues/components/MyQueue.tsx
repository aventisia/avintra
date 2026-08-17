import { QueueTypesEnum } from "../enums/queue-instance-type-enum";
import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { QueueOverview } from "./queue-overview/QueueOverview";
import { WorkItemDetails } from "./work-item-details/WorkItemDetails";
import { MyQueueWokItemTable } from "./work-item-table/MyQueueWokItemTable";

export const MyQueue = () => {
  const { workItemId, queueId, queueType } = useMyQueueParams();

  // In agent-queue mode work items are view-only and opened from the table
  // itself; a `wid` in the URL is ignored to keep the table as the entry point.
  if (workItemId && queueType === QueueTypesEnum.User) return <WorkItemDetails />;
  // No queue selected yet -> show the overview summary of all accessible queues.
  if (!queueId) return <QueueOverview />;
  return <MyQueueWokItemTable />;
};
