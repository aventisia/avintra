import { DTRowAction } from "@aventisia/ui/data-table";
import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { ModelRowOpenAction } from "./ModelOpenAction";
// import { ModelLabelDataAction } from "./ModelLabelDataAction";
import { ModelRowDeleteAction } from "./ModelRowDeleteAction";

// import { ModelTestAction } from "./ModelTestAction";

interface ModelRowActionsProps {
  rowId: string;
}

export const ModelRowActions = ({ rowId }: ModelRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* To Label data model */}
      {/* <ModelLabelDataAction rowId={rowId} /> */}

      {/* To Test model */}
      {/* <ModelTestAction rowId={rowId} /> */}

      {/* To open a row */}
      <ModelRowOpenAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* View the model details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit model details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers model delete alert dialog  */}
      <ModelRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
