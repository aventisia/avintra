import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

import {
  SUB_PLANS_INITIAL_STATE,
  SUB_PLANS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchSubPlans } from "../hooks/useFetchSubPlans.ee";
import { SubPlansBulkActions } from "./SubPlansBulkActions.ee";
import { subPlansTableColumns } from "./SubPlansTableColumns.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: SUB_PLANS_PAGE_SIZE_OPTIONS,
};

/**
 * Renders a table of Subscription Plans.
 *
 * @returns The rendered SubPlansTable component.
 */
export const SubPlansTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch subscription plans data
  const { data } = useFetchSubPlans();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: subPlansTableColumns,
    initialState: SUB_PLANS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  // Return the rendered TableCN component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>

            <div className="flex items-center gap-2">
              <DTCreateButton buttonText="Create plan" entity="subscriptionPlan" />
            </div>
          </div>

          {/* Data table with its search, view options, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<SubPlansBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search plans..." />
          </TableCN>
        </div>
      ) : (
        // Show data table skeleton while fetching the plans data
        <TableCNSkeleton columnCount={6} />
      )}
    </>
  );
};
