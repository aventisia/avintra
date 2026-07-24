import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { CreditPlansRowDeleteAction } from "./CreditPlansRowDeleteAction";

// import { ModelTestAction } from "./ModelTestAction";

interface ModelRowActionsProps {
  rowId: string;
}

export const CreditPlansRowActions = ({ rowId }: ModelRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* View the model details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="creditPlan" />

      {/* Edit model details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="creditPlan" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers model delete alert dialog  */}
      <CreditPlansRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
