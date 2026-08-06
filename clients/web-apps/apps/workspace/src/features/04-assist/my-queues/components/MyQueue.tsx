import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { QueueOverview } from "./queue-overview/QueueOverview";
import { WorkItemDetails } from "./work-item-details/WorkItemDetails";
import { MyQueueWokItemTable } from "./work-item-table/MyQueueWokItemTable";

export const MyQueue = () => {
  const { workItemId, queueId } = useMyQueueParams();

  if (workItemId) return <WorkItemDetails />;
  // No queue selected yet -> show the overview summary of all accessible queues.
  if (!queueId) return <QueueOverview />;
  return <MyQueueWokItemTable />;
};
