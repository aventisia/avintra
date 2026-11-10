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
  CREDIT_PLANS_INITIAL_STATE,
  CREDIT_PLANS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchCreditPlans } from "../hooks/useFetchCreditPlans.ee";
import { CreditsBulkActions } from "./CreditBulkActions.ee";
import { creditPlansTableColumns } from "./CreditPlansTableColumns.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: CREDIT_PLANS_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of credits.
 *
 * @returns The rendered CreditsPlansTable component.
 */
export const CreditPlansTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch models data
  const { data } = useFetchCreditPlans();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: creditPlansTableColumns,
    getRowId: (row) => row.id ?? "",
    initialState: CREDIT_PLANS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["serviceType"],
  });

  // Return the rendered TableCN component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>

            <div className="flex items-center gap-2">
              <CrudCreateButton buttonText="Create plan" entity="creditPlan" />
            </div>
          </div>

          {/* Data table with its search, view options, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<CreditsBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search plan..." />
          </TableCN>
        </div>
      ) : (
        // Show the table skeleton while fetching the plans
        <TableCNSkeleton columnCount={6} />
      )}
    </>
  );
};
