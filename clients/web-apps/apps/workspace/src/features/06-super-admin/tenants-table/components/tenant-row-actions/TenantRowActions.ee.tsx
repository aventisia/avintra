import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { TenantRowDeleteAction } from "./TenantRowDeleteAction.ee";
import { TenantSwitchRowAction } from "./TenantSwitchRowAction.ee";

interface TenantRowActionsProps {
  rowId: string;
}

export const TenantRowActions = ({ rowId }: TenantRowActionsProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* View the tenant details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="tenant" />

      {/* Edit tenant details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="tenant" />

      <TenantSwitchRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Tenant delete alert dialog  */}
      <TenantRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
