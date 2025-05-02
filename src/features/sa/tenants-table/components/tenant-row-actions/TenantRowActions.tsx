import { DTRowAction } from "@aventisia/ui/data-table";
import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { TenantRowDeleteAction } from "./TenantRowDeleteAction";

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

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Tenant delete alert dialog  */}
      <TenantRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
