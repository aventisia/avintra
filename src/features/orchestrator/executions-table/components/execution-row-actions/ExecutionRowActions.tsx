import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { ExecutionStatusTypesEnum } from "@/react-toolkit/enums/execution-status-type-enum";

import { ExecutionsTableDto } from "../../dtos/executions-table-dto";

import { ExecutionRowCancelAction } from "./ExecutionRowCancelAction";
import { ExecutionRowDeleteAction } from "./ExecutionRowDeleteAction";
import { ExecutionRowRetryAction } from "./ExecutionRowRetryAction";

interface ExecutionRowActionsProps {
  rowId: string;
  row: Partial<ExecutionsTableDto>;
}

export const ExecutionRowActions = (props: ExecutionRowActionsProps) => {
  return (
    // Dropdown menu for Execution table row action */}
    <DataTableRowActions>
      {/* View the Execution details */}
      <DTRowAction rowId={props.rowId} crudAction="read" />

      {/* Edit Execution details */}
      <DTRowAction rowId={props.rowId} crudAction="update" />

      {/* retry the failed transaction */}
      {props.row.status === ExecutionStatusTypesEnum.Failed ? (
        <ExecutionRowRetryAction id={props.rowId} name={props.row.name} />
      ) : (
        <></>
      )}

      {/* retry the cancel transaction */}
      {props.row.status === ExecutionStatusTypesEnum.Running ? (
        <ExecutionRowCancelAction id={props.rowId} name={props.row.name} />
      ) : (
        <></>
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Execution delete alert dialog  */}
      <ExecutionRowDeleteAction rowId={props.rowId} />
    </DataTableRowActions>
  );
};
