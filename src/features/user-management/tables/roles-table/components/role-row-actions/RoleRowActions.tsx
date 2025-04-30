import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

import { RoleRowDeleteAction } from "./RoleRowDeleteAction";

interface RoleRowActionsProps {
  rowId: string;
}

export const RoleRowActions = ({ rowId }: RoleRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <DataTableRowActions>
      {/* View the User details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit User details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <RoleRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
