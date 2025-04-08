import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

import { RoleRowDeleteAction } from "./RoleRowDeleteAction";

interface RoleRowActionsProps {
  rowId: string;
}

export const RoleRowActions = ({ rowId }: RoleRowActionsProps) => {
  return (
    // Dropdown menu for Role table row action */}
    <DataTableRowActions>
      {/* View the Role details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit Role details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Role delete alert dialog  */}
      <RoleRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
