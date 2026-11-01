import { DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";

import {
  ARCHIVED_FLOWS_INITIAL_STATE,
  ARCHIVED_FLOWS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchArchivedFlows } from "../hooks/useFetchArchivedFlows";
import { archivedFlowsTableColumns } from "./ArchivedFlowsTableColumns";

const PAGINATION_PROPS = { pageSizeOptions: ARCHIVED_FLOWS_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of Archived flows.
 *
 * @returns The rendered ArchivedFlowsTable component.
 */
export const ArchivedFlowsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch Archived flows data
  const { data } = useFetchArchivedFlows();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: archivedFlowsTableColumns,
    initialState: ARCHIVED_FLOWS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
          </div>
          {/* Table with its toolbar and pagination footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table} searchPlaceholder="Search agents..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the Archived flows data
        <TableCNSkeleton columnCount={6} />
      )}
    </>
  );
};
