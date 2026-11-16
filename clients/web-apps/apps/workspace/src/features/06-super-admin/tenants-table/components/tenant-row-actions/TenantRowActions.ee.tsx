import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { TenantRowDeleteAction } from "./TenantRowDeleteAction.ee";
import { TenantSwitchRowAction } from "./TenantSwitchRowAction.ee";

interface TenantRowActionsProps {
  rowId: string;
}

export const TenantRowActions = ({ rowId }: TenantRowActionsProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <TableCNRowActionsMenu ariaLabel="Open tenant actions">
      {/* View the tenant details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="tenant" />

      {/* Edit tenant details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="tenant" />

      <TenantSwitchRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Tenant delete alert dialog  */}
      <TenantRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
