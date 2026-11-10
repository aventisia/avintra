import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { useFetchAllQueues } from "../../queues-table/hooks/useFetchQueues";
import { TABLE_KEY, WORK_ITEMS_INITIAL_STATE, WORK_ITEMS_PAGE_SIZE_OPTIONS } from "../constants";
import { useFetchQueuesWorkItems } from "../hooks/useFetchQueuesWorkItems";
import {
  WorkItemsTableRow,
  customColumnId,
  parseWorkItemData,
  tableCustomFields,
} from "../utils/work-items-custom-columns.util";
import { PayloadTableHeading } from "./TableHeading";
import { WorkItemBulkActions } from "./WorkItemBulkActions";
import { workItemsTableColumns } from "./WorkItemsTableColumns";

const PAGINATION_PROPS = { pageSizeOptions: WORK_ITEMS_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of WorkItems.
 *
 * @returns The rendered WorkItemsTable component.
 */
export const WorkItemsTable = () => {
  const { qid: queueId = "" } = useParams();
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name") ?? "WorkItem";
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);
  const navigate = useNavigate();

  // IMPORTANT NOTE: keep the table key per queue; custom column ids are field names,
  // so a shared key would carry a hidden column from one queue to another.
  const tableKey = `${TABLE_KEY}-${queueId}`;

  // The work items screen is reachable from both the Personal and the Shared
  // queues tab, so the queue must be resolved against both lists.
  const { data: queuesData, isLoading } = useFetchAllQueues();

  const queue = useMemo(
    () => queuesData?.data?.find((item) => item.id === queueId),
    [queuesData?.data, queueId],
  );

  // IMPORTANT NOTE: the work-item list endpoint does not check queue access, so
  // rows are fetched only after the queue resolves from the accessible lists.
  const { data } = useFetchQueuesWorkItems(Boolean(queue));

  const customFields = useMemo(() => tableCustomFields(queue?.inputSchema), [queue?.inputSchema]);

  const rows = useMemo<WorkItemsTableRow[]>(() => {
    const items = data?.data ?? [];
    if (customFields.length === 0) return items;

    return items.map((item) => ({ ...item, customData: parseWorkItemData(item.workItemData) }));
  }, [customFields.length, data?.data]);

  const searchColumns = useMemo(
    () => ["workItemId", ...customFields.map(customColumnId)],
    [customFields],
  );

  // Resolve Prod-capped actions so the work-item table's read-only gate matches the row actions.
  const { actions, isProd } = useConfigureResourceAccessActions(
    queue?.accessLevel ?? ResourceAccessTypeEnum.View,
  );

  // if the KB does not exist in Queue list/shared revert user back to Queues page
  useEffect(() => {
    if (!isLoading && !queue) navigate("/configure/queues");
  }, [isLoading, queue, navigate]);

  const hasOnlyReadAccess = useMemo(() => {
    if (!queue) return true;
    return isProd ? !actions.update : queue.accessLevel === "View";
  }, [queue, isProd, actions.update]);

  const columns = useMemo(() => {
    const allColumns = workItemsTableColumns(name, customFields);
    if (!hasOnlyReadAccess) return allColumns;

    return allColumns.filter((column) => column.id !== "actions");
  }, [customFields, hasOnlyReadAccess, name]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: rows,
    columns,
    initialState: WORK_ITEMS_INITIAL_STATE,
    persistKey: tableKey,
    searchColumns,
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading queueName={data?.data[0]?.queueName || name} />
          </div>
          {/* Table with its toolbar and pagination footer */}
          <TableCN
            table={table}
            label={name}
            paginationProps={PAGINATION_PROPS}
            actionBar={!hasOnlyReadAccess && <WorkItemBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the WorkItems data
        <TableCNSkeleton columnCount={7} />
      )}
    </>
  );
};
