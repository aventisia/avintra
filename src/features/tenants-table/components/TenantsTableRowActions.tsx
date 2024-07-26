import { DataTableRowActions } from "@/react-toolkit/data-table/components/row-actions/DataTableRowActions";
import { DTDeleteRowAction } from "@/react-toolkit/data-table/components/row-actions/DTDeleteRowAction";
import { DTEditRowAction } from "@/react-toolkit/data-table/components/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/data-table/components/row-actions/DTViewRowAction";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { tenantOptimisticMutationFn } from "../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import { TenantsTableDto } from "../dtos/tenants-table-dto";

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
  // Get mutation function to delete the tenant
  const { mutate: deleteTenant } = useListOptimisticMutation<
    string,
    TenantsTableDto | boolean,
    TenantsTableDto
  >(tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Return the component
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
      <DTDeleteRowAction
        rowDeleteMutateFn={() =>
          deleteTenant({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
        description="This action cannot be undone. Are you sure you want to delete this tenant?"
        confirmBtnText="Yes, delete tenant"
      />
    </DataTableRowActions>
  );
};
