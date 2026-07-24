import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RoleRowDeleteAction } from "./RoleRowDeleteAction";

interface RoleRowActionsProps {
  rowId: string;
}

export const RoleRowActions = ({ rowId }: RoleRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <DataTableRowActions>
      {/* View the User details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="role" />

      {/* Edit User details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="role" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <RoleRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
