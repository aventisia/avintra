import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";

import {
  ROLES_INITIAL_STATE,
  ROLES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchRoles } from "../hooks/useFetchRoles";
import { RolesTableColumns } from "./RolesTableColumns";
import { RolesBulkActions } from "./role-row-actions/RolesBulkActions";

const PAGINATION_PROPS = { pageSizeOptions: ROLES_PAGE_SIZE_OPTIONS };

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

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: RolesTableColumns,
    getRowId: (row) => row.id,
    initialState: ROLES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["fullName"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <TableCNHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <CrudCreateButton entity="role" />
            </div>
          </div>

          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<RolesBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search users..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the users data
        <TableCNSkeleton columnCount={11} />
      )}
    </>
  );
};
