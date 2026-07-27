import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { CLOSING_JOB_STATUSES, JobRowDeleteAction, JobStatusEnum } from "../..";

interface JobRowActionsProps {
  rowId: string;
  status?: JobStatusEnum;
}

export const JobRowActions = ({ rowId, status }: JobRowActionsProps) => {
  // Jobs that are already completed or closed cannot be edited.
  const isEditable = status ? !CLOSING_JOB_STATUSES.includes(status) : true;

  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" entity="job" />
      {isEditable && <DTRowAction rowId={rowId} crudAction="update" entity="job" />}
      <DropdownMenuSeparator />
      <JobRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
