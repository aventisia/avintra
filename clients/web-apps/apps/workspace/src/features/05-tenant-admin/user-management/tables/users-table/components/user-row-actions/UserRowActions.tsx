import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { UserRowDeleteAction } from "./UserRowDeleteAction";

interface UserRowActionsProps {
  rowId: string;
}

export const UserRowActions = ({ rowId }: UserRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <DataTableRowActions>
      {/* View the User details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="user" />

      {/* Edit User details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="user" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <UserRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
