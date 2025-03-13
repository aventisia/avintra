import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { ConfigRowDeleteAction } from "./ConfigRowDeleteAction";

interface ConfigRowActionsProps {
  rowId: string;
}

export const ConfigRowActions = ({ rowId }: ConfigRowActionsProps) => {
  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions>
      {/* View the config details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit config details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Config delete alert dialog  */}
      <ConfigRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
