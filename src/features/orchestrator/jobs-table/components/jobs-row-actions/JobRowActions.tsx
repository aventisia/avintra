import { DataTableRowActions } from "@aventisia/ui/data-table";

import { JobStatusTypesEnum } from "../../enums/job-status-type-enum";

import { JobRowAbortAction } from "./JobRowAbortAction";
import { JobRowDeleteAction } from "./JobRowDeleteAction";

interface JobRowActionsProps {
  rowId: string;
  status: JobStatusTypesEnum;
}

export const JobRowActions = ({ rowId, status }: JobRowActionsProps) => {
  return (
    // Dropdown menu for JObs table row action */}
    <DataTableRowActions>
      {/* Abort action for any running jobs*/}
      {status === JobStatusTypesEnum.Running ? (
        <JobRowAbortAction rowId={rowId} />
      ) : (
        <></>
      )}
      {/* Delete action for any scheduled jobs*/}
      {status === JobStatusTypesEnum.Created ? (
        <JobRowDeleteAction rowId={rowId} />
      ) : (
        <></>
      )}
    </DataTableRowActions>
  );
};
