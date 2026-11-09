import { UpgradeCreateButton } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  TABLE_HEADING,
  TABLE_KEY,
  USERS_INITIAL_STATE,
  USERS_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchUserSpaces } from "../hooks/useFetchUserSpaces";
import { useFetchUsers } from "../hooks/useFetchUsers";
import { usersTableColumns } from "./UsersTableColumns";
import { UsersBulkActions } from "./user-row-actions/UsersBulkActions";

const PAGINATION_PROPS = { pageSizeOptions: USERS_PAGE_SIZE_OPTIONS };

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

  // Fetch spaces to resolve space IDs to names in the Spaces column.
  const { data: userSpaces } = useFetchUserSpaces();

  // Build a map of space ID -> space name for the Spaces column.
  const spaceIdToName = useMemo(
    () => new Map((userSpaces?.data || []).map((option) => [option.value, option.label])),
    [userSpaces?.data],
  );

  const columns = useMemo(() => usersTableColumns(spaceIdToName), [spaceIdToName]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id ?? "",
    initialState: USERS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["firstName"],
  });

  const { deploymentType, planType } = useUserSessionStore(
    useShallow((state) => ({
      deploymentType: state.userSession?.deploymentType,
      planType: state.userSession?.planType,
    })),
  );
  const isStarterPlan = planType === "Starter" && deploymentType !== "Community";

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>

            <div className="flex items-center gap-2">
              {isStarterPlan ? (
                <UpgradeCreateButton label="Invite" upgradePath="/tenant/overview" />
              ) : (
                <CrudCreateButton buttonText="Invite" entity="user" />
              )}
            </div>
          </div>

          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<UsersBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search users..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the users data
        <TableCNSkeleton columnCount={8} />
      )}
    </>
  );
};
