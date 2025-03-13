import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { JobRowRetryAction } from "./JobRowRetryAction";
import { JobRowDeleteAction } from "./JobRowDeleteAction";
import { JobsTableDto } from "../../dtos/jobs-table-dto";
import { JobStatusTypesEnum } from "@/react-toolkit/enums/job-status-type-enum";
import { JobRowCancelAction } from "./JobRowCancelAction";

interface JobRowActionsProps {
  rowId: string;
  row: Partial<JobsTableDto>;
}

export const JobRowActions = (props: JobRowActionsProps) => {
  return (
    // Dropdown menu for Job table row action */}
    <DataTableRowActions>
      {/* View the Job details */}
      <DTRowAction rowId={props.rowId} crudAction="read" />

      {/* Edit Job details */}
      <DTRowAction rowId={props.rowId} crudAction="update" />

      {/* retry the failed transaction */}
      {props.row.status === JobStatusTypesEnum.Failed ? (
        <JobRowRetryAction id={props.rowId} name={props.row.name} />
      ) : (
        <></>
      )}

      {/* retry the cancel transaction */}
      {props.row.status === JobStatusTypesEnum.Running ? (
        <JobRowCancelAction id={props.rowId} name={props.row.name} />
      ) : (
        <></>
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Job delete alert dialog  */}
      <JobRowDeleteAction rowId={props.rowId} />
    </DataTableRowActions>
  );
};
