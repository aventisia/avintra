import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { OnPremTenantDeleteAction } from "./OnPremTenantDeleteAction";
import { TenantInstanceOpenAction } from "./TenantInstanceOpenAction";

interface OnPremTenantRowActionProps {
  rowId: string;
  name: string;
}

export const OnPremTenantRowAction = ({ rowId, name }: OnPremTenantRowActionProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* To open tenant in studio */}
      <TenantInstanceOpenAction rowId={rowId} cellValue={name} />

      {/* View the tenant details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="onPremTenant" />

      {/* Edit tenant details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="onPremTenant" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers tenant delete alert dialog  */}
      <OnPremTenantDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
