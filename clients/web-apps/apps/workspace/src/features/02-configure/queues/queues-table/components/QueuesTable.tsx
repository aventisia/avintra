import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useMemo } from "react";

import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  QUEUES_INITIAL_STATE,
  QUEUES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchQueues } from "../hooks/useFetchQueues";
import { useTableTab } from "../hooks/useTableTab";
import { queuesTableColumns } from "./QueuesTableColumns";
import { QueueBulkActions } from "./queue-row-actions/QueueBulkActions";
import UploadItemsDialog from "./queue-upload-items/UploadItemsDialog";

const PAGINATION_PROPS = { pageSizeOptions: QUEUES_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of queues.
 *
 * @returns The rendered queuesTable component.
 */
export const QueuesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch queues data
  const { data } = useFetchQueues();

  const columns = useMemo(() => queuesTableColumns(), []);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id,
    initialState: QUEUES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <DTCreateButton entity="queue" />
            </div>
          </div>
          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<QueueBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search queues..." />
          </TableCN>
          <UploadItemsDialog />
          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} allowInProd />
          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the queues data
        <TableCNSkeleton columnCount={8} />
      )}
    </>
  );
};
