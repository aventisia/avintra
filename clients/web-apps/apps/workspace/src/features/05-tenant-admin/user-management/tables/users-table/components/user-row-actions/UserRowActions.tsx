import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { UserRowDeleteAction } from "./UserRowDeleteAction";

interface UserRowActionsProps {
  rowId: string;
}

export const UserRowActions = ({ rowId }: UserRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <TableCNRowActionsMenu ariaLabel="Open user actions">
      {/* View the User details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="user" />

      {/* Edit User details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="user" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <UserRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
