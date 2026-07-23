import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { SubPlansRowDeleteAction } from "./SubPlansRowDeleteAction";

interface SubPlansRowActionsProps {
  rowId: string;
}

export const SubPlansRowActions = ({ rowId }: SubPlansRowActionsProps) => {
  return (
    // Dropdown menu for plans table row action */}
    <DataTableRowActions>
      {/* View the plans details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit plans details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers SubPlans delete alert dialog  */}
      <SubPlansRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
