import { useMyQueueParams } from "../hooks/useMyQueueParams";

import { MyQueueWokItemTable } from "./MyQueueWokItemTable";
import { WorkItemDetails } from "./MyQueueWorkItem";

export const MyQueue = () => {
  const { workItemId } = useMyQueueParams();

  if (workItemId) return <WorkItemDetails />;
  else return <MyQueueWokItemTable />;
};
