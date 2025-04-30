import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

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
