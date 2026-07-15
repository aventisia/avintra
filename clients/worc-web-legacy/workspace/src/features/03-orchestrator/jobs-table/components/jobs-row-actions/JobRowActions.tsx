import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { JobRowDeleteAction, JobStatusEnum } from "../..";

interface JobRowActionsProps {
  rowId: string;
  status?: JobStatusEnum;
}

export const JobRowActions = ({ rowId }: JobRowActionsProps) => {
  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" />
      <DTRowAction rowId={rowId} crudAction="update" />
      <DropdownMenuSeparator />
      <JobRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
