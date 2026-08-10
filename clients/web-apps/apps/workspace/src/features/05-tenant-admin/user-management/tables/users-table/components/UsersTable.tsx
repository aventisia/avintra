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

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchUserSpaces } from "../hooks/useFetchUserSpaces";
import { useFetchUsers } from "../hooks/useFetchUsers";
import { usersTableColumns } from "./UsersTableColumns";
import { UsersBulkActions } from "./user-row-actions/UsersBulkActions";

/**
 * Renders a table of users.
 *
 * @returns The rendered UsersTable component.
 */
export const UsersTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch users data
  const { data } = useFetchUsers();

  // Fetch spaces to resolve space IDs to names in the Spaces column.
  const { data: userSpaces } = useFetchUserSpaces();

  // Build a map of space ID -> space name for the Spaces column.
  const spaceIdToName = new Map(
    (userSpaces?.data || []).map((option) => [option.value, option.label]),
  );

  const columns = usersTableColumns(spaceIdToName);

  // Create a React table for users data
  const table = useDataTable(
    columns,
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
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["firstName"]}
                placeholder="Search users..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Invite" entity="user" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={columns.length} />
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
