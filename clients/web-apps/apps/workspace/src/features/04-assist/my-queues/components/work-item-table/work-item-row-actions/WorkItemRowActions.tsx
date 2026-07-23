import { DataTableRowActions } from "@avplatform/ui/data-table";
import { QueueWorkItemStatusEnum } from "@avplatform/ui/enums/queue-work-item-status-enum";

import { WorkItemRowOpenAction } from "./WorkItemRowOpenAction";

interface JobRowActionsProps {
  rowId: string;

  status: QueueWorkItemStatusEnum | string;
}

export const WorkItemActions = ({ rowId, status }: JobRowActionsProps) => {
  return (
    // Dropdown menu for JObs table row action */}
    <DataTableRowActions>
      {/* Delete action for any scheduled jobs*/}
      <WorkItemRowOpenAction rowId={rowId} status={status} />
    </DataTableRowActions>
  );
};
