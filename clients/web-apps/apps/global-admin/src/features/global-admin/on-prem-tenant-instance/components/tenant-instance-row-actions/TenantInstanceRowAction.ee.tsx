import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { TenantInstanceDeleteAction } from "./TenantInstanceDeleteAction.ee";
import { TenantInstanceOpenAction } from "./TenantInstanceOpenAction.ee";

interface TenantInstanceRowActionProps {
  rowId: string;
  name: string;
}

export const TenantInstanceRowAction = ({ rowId, name }: TenantInstanceRowActionProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <TableCNRowActionsMenu ariaLabel="Open tenant instance actions">
      {/* To open tenant in studio */}
      <TenantInstanceOpenAction rowId={rowId} name={name} />

      {/* View the tenant details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="tenantInstance" />

      {/* Edit tenant details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="tenantInstance" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers tenant delete alert dialog  */}
      <TenantInstanceDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
