import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchUsers } from "../hooks/useFetchUsers";

import { UserCrudDialog } from "./user-crud-dialog/UserCrudDialog";
import { UsersBulkActions } from "./user-row-actions/UsersBulkActions";
import { usersTableColumns } from "./UsersTableColumns";

/**
 * Renders a table of users.
 *
 * @returns The rendered UsersTable component.
 */
export const UsersTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch users data
  const { data } = useFetchUsers();

  // Create a React table for users data
  const table = useDataTable(
    usersTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <UserCrudDialog>
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
            <DataTable table={table} columnsLength={usersTableColumns.length} />
          </UserCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <UsersBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the users data
        <DataTableSkeleton />
      )}
    </>
  );
};
