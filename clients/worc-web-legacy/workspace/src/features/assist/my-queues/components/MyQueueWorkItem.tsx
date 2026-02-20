import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { NavLink } from "react-router-dom";

import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { useQueueBackLink } from "../hooks/useQueueBackLink";

export const WorkItemDetails = () => {
  const { workItemId, queueId } = useMyQueueParams();

  const backToList = useQueueBackLink();

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavLink to={backToList}>My Queues</NavLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-64 truncate capitalize">
                {workItemId}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </h2>
      {/* Debug / placeholder content */}
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <div>
          <strong>Queue ID:</strong> {queueId}
        </div>
        <div>
          <strong>Work Item ID:</strong> {workItemId}
        </div>
      </div>
    </div>
  );
};
