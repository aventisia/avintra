import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { CreditPlansRowDeleteAction } from "./CreditPlansRowDeleteAction.ee";

// import { ModelTestAction } from "./ModelTestAction";

interface ModelRowActionsProps {
  rowId: string;
}

export const CreditPlansRowActions = ({ rowId }: ModelRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <TableCNRowActionsMenu ariaLabel="Open credit plans actions" contentClassName="w-32">
      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* View the model details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="creditPlan" />

      {/* Edit model details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="creditPlan" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers model delete alert dialog  */}
      <CreditPlansRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
