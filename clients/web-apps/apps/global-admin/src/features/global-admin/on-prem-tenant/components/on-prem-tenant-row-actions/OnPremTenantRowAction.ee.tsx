import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { OnPremTenantDeleteAction } from "./OnPremTenantDeleteAction.ee";
import { TenantInstanceOpenAction } from "./TenantInstanceOpenAction.ee";

interface OnPremTenantRowActionProps {
  rowId: string;
  name: string;
}

export const OnPremTenantRowAction = ({ rowId, name }: OnPremTenantRowActionProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <TableCNRowActionsMenu ariaLabel="Open on prem tenant actions">
      {/* To open tenant in studio */}
      <TenantInstanceOpenAction rowId={rowId} cellValue={name} />

      {/* View the tenant details */}
      <CrudRowAction rowId={rowId} crudAction="read" entity="onPremTenant" />

      {/* Edit tenant details */}
      <CrudRowAction rowId={rowId} crudAction="update" entity="onPremTenant" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers tenant delete alert dialog  */}
      <OnPremTenantDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
