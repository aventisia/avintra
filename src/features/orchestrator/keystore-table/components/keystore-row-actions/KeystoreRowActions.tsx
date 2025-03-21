import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { KeystoreRowDeleteAction } from "./KeystoreRowDeleteAction";

interface KeystoreRowActionsProps {
  rowId: string;
}

export const KeystoreRowActions = ({ rowId }: KeystoreRowActionsProps) => {
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
      <KeystoreRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
