import { DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TEMPLATES_APPROVAL_INITIAL_STATE,
  TEMPLATES_APPROVAL_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchPendingTemplates } from "../hooks/useFetchPendingTemplates";
import RejectWithRemarkDialog from "./RejectWithRemarkDialog";
import { templatesApprovalTable } from "./TemplatesApprovalTableColumns";

const PAGINATION_PROPS = { pageSizeOptions: TEMPLATES_APPROVAL_PAGE_SIZE_OPTIONS };

/**
 * Displays a table of templates pending approval.
 *
 * This table includes sorting, filtering, search, column visibility options,
 * pagination, and row-level actions.
 *
 * @param isSuperAdmin - Optional flag indicating whether the current user is a super admin.
 * @returns A rendered React component with the templates approval data.
 */
export const TemplatesApprovalTable = ({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) => {
  // Set browser tab title
  useDocumentTitle("Approvals");

  // Fetch pending templates data based on user role
  const { data } = useFetchPendingTemplates(isSuperAdmin);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: templatesApprovalTable,
    initialState: TEMPLATES_APPROVAL_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table heading */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
          </div>

          {/* Main table with its toolbar and pagination footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table} searchPlaceholder="Search..." />
          </TableCN>
          {/* Dialog used when rejecting a template with remarks */}
          <RejectWithRemarkDialog />
        </div>
      ) : (
        // Loading placeholder displayed while fetching data
        <TableCNSkeleton columnCount={6} />
      )}
    </>
  );
};
