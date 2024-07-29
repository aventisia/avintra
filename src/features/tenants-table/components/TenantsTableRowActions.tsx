import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTEditRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTViewRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { TenantDeleteRowAction } from "./TenantDeleteRowAction";

interface TenantsTableRowActionsProps {
  /** The ID of the row */
  rowId: string;
}

/**
 * Renders the actions for a table row in the tenants table.
 *
 * @param {TenantsTableRowActionsProps} props - The component props.
 * @returns {JSX.Element} The rendered row actions component for tenants table.
 */
export const TenantsTableRowActions = ({
  rowId,
}: TenantsTableRowActionsProps) => {
  return (
    // Dropdown menu for tenant table row action */}
    <DataTableRowActions>
      {/* Opens crud dialog to view the tenant details */}
      <DTViewRowAction rowId={rowId} />

      {/* Opens crud dialog to update tenant details */}
      <DTEditRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Tenant delete alert dialog  */}
      <TenantDeleteRowAction tenantId={rowId} />
    </DataTableRowActions>
  );
};
