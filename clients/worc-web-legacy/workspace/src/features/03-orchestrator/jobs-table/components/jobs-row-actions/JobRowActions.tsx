import { DataTableRowActions } from "@aventisia/ui/data-table";

import { JobStatusEnum } from "../../enums/job-status-enum";

import { JobRowAbortAction } from "./JobRowAbortAction";
import { JobRowDeleteAction } from "./JobRowDeleteAction";

interface JobRowActionsProps {
  rowId: string;
  status: JobStatusEnum;
}

export const JobRowActions = ({ rowId, status }: JobRowActionsProps) => {
  return (
    // Dropdown menu for JObs table row action */}
    <DataTableRowActions>
      {/* Abort action for any running jobs*/}
      {status === JobStatusEnum.Running ? (
        <JobRowAbortAction rowId={rowId} />
      ) : (
        <></>
      )}
      {/* Delete action for any scheduled jobs*/}
      {status === JobStatusEnum.Created ? (
        <JobRowDeleteAction rowId={rowId} />
      ) : (
        <></>
      )}
    </DataTableRowActions>
  );
};
