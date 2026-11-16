import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { CLOSING_JOB_STATUSES, JobRowDeleteAction, JobStatusEnum } from "../..";

interface JobRowActionsProps {
  rowId: string;
  status?: JobStatusEnum;
}

export const JobRowActions = ({ rowId, status }: JobRowActionsProps) => {
  // Jobs that are already completed or closed cannot be edited.
  const isEditable = status ? !CLOSING_JOB_STATUSES.includes(status) : true;

  return (
    <TableCNRowActionsMenu ariaLabel="Open job actions">
      <CrudRowAction rowId={rowId} crudAction="read" entity="job" />
      {isEditable && <CrudRowAction rowId={rowId} crudAction="update" entity="job" />}
      <DropdownMenuSeparator />
      <JobRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
