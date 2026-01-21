import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { OnPremLLMRowDeleteAction } from "./OnPremLLMRowDeleteAction";

// import { ModelTestAction } from "./ModelTestAction";

interface OnPremLLMActionsProps {
  rowId: string;
}

export const OnPremLLMRowActions = ({ rowId }: OnPremLLMActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* View the model details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit model details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers model delete alert dialog  */}
      <OnPremLLMRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
