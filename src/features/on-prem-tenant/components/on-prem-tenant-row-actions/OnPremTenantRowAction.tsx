import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { OnPremTenantDeleteAction } from "./OnPremTenantDeleteAction";
import { TenantInstanceOpenAction } from "./TenantInstanceOpenAction";

interface OnPremTenantRowActionProps {
  rowId: string;
}

export const OnPremTenantRowAction = ({
  rowId,
}: OnPremTenantRowActionProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* To open tenant in studio */}
      <TenantInstanceOpenAction rowId={rowId} />

      {/* View the tenant details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit tenant details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers tenant delete alert dialog  */}
      <OnPremTenantDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
