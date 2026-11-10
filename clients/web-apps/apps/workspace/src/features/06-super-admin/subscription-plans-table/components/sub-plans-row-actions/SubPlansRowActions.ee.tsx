import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { SubPlansRowDeleteAction } from "./SubPlansRowDeleteAction.ee";

interface SubPlansRowActionsProps {
  rowId: string;
}

export const SubPlansRowActions = ({ rowId }: SubPlansRowActionsProps) => {
  return (
    // Dropdown menu for plans table row action */}
    <TableCNRowActionsMenu ariaLabel="Open sub plans actions">
      {/* View the plans details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="subscriptionPlan" />

      {/* Edit plans details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="subscriptionPlan" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers SubPlans delete alert dialog  */}
      <SubPlansRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
