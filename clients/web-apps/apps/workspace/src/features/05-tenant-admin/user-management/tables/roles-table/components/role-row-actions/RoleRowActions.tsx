import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { RoleRowDeleteAction } from "./RoleRowDeleteAction";

interface RoleRowActionsProps {
  rowId: string;
}

export const RoleRowActions = ({ rowId }: RoleRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <TableCNRowActionsMenu ariaLabel="Open role actions">
      {/* View the User details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="role" />

      {/* Edit User details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="role" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <RoleRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
