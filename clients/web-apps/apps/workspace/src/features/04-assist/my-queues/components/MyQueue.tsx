import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { QueueOverview } from "./queue-overview/QueueOverview";
import { WorkItemDetails } from "./work-item-details/WorkItemDetails";
import { MyQueueWokItemTable } from "./work-item-table/MyQueueWokItemTable";

export const MyQueue = () => {
  const { workItemId, queueId } = useMyQueueParams();

  // When a work item is selected (from either a user queue or an agent queue),
  // show its details. Agent-queue work items are rendered in view-only mode.
  if (workItemId) return <WorkItemDetails />;
  // No queue selected yet -> show the overview summary of all accessible queues.
  if (!queueId) return <QueueOverview />;
  return <MyQueueWokItemTable />;
};
