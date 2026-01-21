import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchPendingTemplates } from "../hooks/useFetchPendingTemplates";

import RejectWithRemarkDialog from "./RejectWithRemarkDialog";
import { templatesApprovalTable } from "./TemplatesApprovalTableColumns";

/**
 * Displays a table of templates pending approval.
 *
 * This table includes sorting, filtering, search, column visibility options,
 * pagination, and row-level actions.
 *
 * @param isSuperAdmin - Optional flag indicating whether the current user is a super admin.
 * @returns A rendered React component with the templates approval data.
 */
export const TemplatesApprovalTable = ({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) => {
  // Set browser tab title
  useDocumentTitle("Approvals");

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch pending templates data based on user role
  const { data } = useFetchPendingTemplates(isSuperAdmin);

  // Initialize table with data and configuration
  const table = useDataTable(
    templatesApprovalTable,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table heading and controls */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              {/* Search bar for filtering data */}
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search..."
              />
              {/* Column visibility and view options */}
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
            </div>
          </div>

          {/* Main data table */}
          <DataTable
            table={table}
            columnsLength={templatesApprovalTable.length}
          />

          {/* Dialog used when rejecting a template with remarks */}
          <RejectWithRemarkDialog />

          {/* Pagination controls */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Loading skeleton displayed while fetching data
        <DataTableSkeleton />
      )}
    </>
  );
};
