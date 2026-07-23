import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { WorkItemDetails } from "./work-item-details/WorkItemDetails";
import { MyQueueWokItemTable } from "./work-item-table/MyQueueWokItemTable";

export const MyQueue = () => {
  const { workItemId } = useMyQueueParams();

  if (workItemId) return <WorkItemDetails />;
  else return <MyQueueWokItemTable />;
};
