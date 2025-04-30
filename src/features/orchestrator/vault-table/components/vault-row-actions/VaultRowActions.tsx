import { DTRowAction } from "@aventisia/ui/data-table";
import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { VaultRowDeleteAction } from "./VaultRowDeleteAction";

interface VaultRowActionsProps {
  rowId: string;
}

export const VaultRowActions = ({ rowId }: VaultRowActionsProps) => {
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
      <VaultRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
