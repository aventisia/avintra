import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { columnDisplayNames } from "@/features/01-build/flows-table/constants/column-display-names";

import { usersTableColumns } from "../../users-table/components/UsersTableColumns";
import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { roleTableColumnvisibilityState } from "../constants/column-visibility-state";
import { useFetchRoles } from "../hooks/useFetchRoles";
import { RolesTableColumns } from "./RolesTableColumns";
import { RoleCrudDialog } from "./role-crud-dialog/RoleCrudDialog";
import { RolesBulkActions } from "./role-row-actions/RolesBulkActions";

/**
 * Renders a table of users.
 *
 * @returns The rendered UsersTable component.
 */
export const RolesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    roleTableColumnvisibilityState,
  );

  // Fetch users data
  const { data } = useFetchRoles();

  // Create a React table for users data
  const table = useDataTable(
    RolesTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <RoleCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumns={["fullName"]}
                  placeholder="Search users..."
                />
                <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable table={table} columnsLength={usersTableColumns.length} />
          </RoleCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <RolesBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the users data
        <DataTableSkeleton />
      )}
    </>
  );
};
