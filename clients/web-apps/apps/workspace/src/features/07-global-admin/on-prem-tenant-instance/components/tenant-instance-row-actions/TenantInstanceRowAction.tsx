import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { TenantInstanceDeleteAction } from "./TenantInstanceDeleteAction";
import { TenantInstanceOpenAction } from "./TenantInstanceOpenAction";

interface TenantInstanceRowActionProps {
  rowId: string;
  name: string;
}

export const TenantInstanceRowAction = ({ rowId, name }: TenantInstanceRowActionProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* To open tenant in studio */}
      <TenantInstanceOpenAction rowId={rowId} name={name} />

      {/* View the tenant details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit tenant details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers tenant delete alert dialog  */}
      <TenantInstanceDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
