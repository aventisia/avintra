import { DataTableRowActions } from "@aventisia/ui/data-table";

import { QueueWorkItemStatusEnum } from "@/react-toolkit/enums/queue-work-item-status-enum";

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
