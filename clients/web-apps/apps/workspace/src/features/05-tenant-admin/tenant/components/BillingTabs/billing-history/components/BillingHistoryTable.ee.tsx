import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

import {
  BILLING_HISTORY_INITIAL_STATE,
  BILLING_HISTORY_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchBillingHistory } from "../hooks/useFetchBillingHistory.ee";
import { billingHistoryTableColumns } from "./BillingHistoryTableColumns.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: BILLING_HISTORY_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of credits.
 *
 * @returns The rendered CreditsPlansTable component.
 */
export const BillingHistoryTable = () => {
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);

  // Fetch models data
  const { data, isLoading } = useFetchBillingHistory();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: billingHistoryTableColumns,
    initialState: BILLING_HISTORY_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name", "type", "paymentStatus"],
  });

  // Return the rendered TableCN component.
  return (
    <>
      {/* Remove the ! operator once we have the actual data */}
      {!isLoading ? (
        <div className="space-y-4 pb-4">
          {/* Table toolbar */}
          <h2 className="text-heading text-ink">{TABLE_HEADING}</h2>

          {/* Data table with its search, view options and pagination footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table} searchPlaceholder="Search history..." />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the history
        <TableCNSkeleton columnCount={6} />
      )}
    </>
  );
};
