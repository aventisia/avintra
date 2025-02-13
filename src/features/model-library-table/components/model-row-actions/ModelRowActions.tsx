import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { ModelRowDeleteAction } from "./ModelRowDeleteAction";
import { ModelRowOpenAction } from "./ModelRowOpenAction";

interface ModelRowActionsProps {
  rowId: string;
}

export const ModelRowActions = ({ rowId }: ModelRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions>
      {/* To open model */}
      <ModelRowOpenAction rowId={rowId} />

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
