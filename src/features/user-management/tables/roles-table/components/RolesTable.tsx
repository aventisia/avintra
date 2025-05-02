import { columnDisplayNames } from "@/features/flows-table/constants/column-display-names";

import { Separator } from "@aventisia/ui";
import { DataTable } from "@aventisia/ui/data-table";
import { DTPagination } from "@aventisia/ui/data-table";
import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { DTCreateButton } from "@aventisia/ui/data-table";
import { DTHeading } from "@aventisia/ui/data-table";
import { DTSearchBox } from "@aventisia/ui/data-table";
import { DTViewOptions } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useDocumentTitle } from "@aventisia/ui/hooks";

import { usersTableColumns } from "../../users-table/components/UsersTableColumns";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
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

  // Fetch users data
  const { data } = useFetchRoles();

  // Create a React table for users data
  const table = useDataTable(
    RolesTableColumns,
    data?.data || [],
    roleTableColumnvisibilityState,
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
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search users..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={usersTableColumns.length}
              />
            </div>
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
