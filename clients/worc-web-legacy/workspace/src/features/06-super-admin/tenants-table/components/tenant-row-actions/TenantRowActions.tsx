import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { TenantRowDeleteAction } from "./TenantRowDeleteAction";
import { TenantSwitchRowAction } from "./TenantSwitchRowAction";

interface TenantRowActionsProps {
  rowId: string;
}

export const TenantRowActions = ({ rowId }: TenantRowActionsProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* View the tenant details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit tenant details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      <TenantSwitchRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Tenant delete alert dialog  */}
      <TenantRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
