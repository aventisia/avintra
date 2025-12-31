import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { KeystoreRowDeleteAction } from "./KeystoreRowDeleteAction";

interface KeystoreRowActionsProps {
  rowId: string;
}

export const KeystoreRowActions = ({ rowId }: KeystoreRowActionsProps) => {
  return (
    // Dropdown menu for keystore table row action */}
    <DataTableRowActions>
      {/* View the keystore details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit keystore details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Keystore delete alert dialog  */}
      <KeystoreRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
