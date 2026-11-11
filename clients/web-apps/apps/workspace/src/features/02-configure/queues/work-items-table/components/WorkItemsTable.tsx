import {
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { useFetchAllQueues } from "../../queues-table/hooks/useFetchQueues";
import { TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchQueuesWorkItems } from "../hooks/useFetchQueuesWorkItems";
import {
  WorkItemsTableRow,
  customColumnId,
  customFieldLabel,
  parseWorkItemData,
  tableCustomFields,
} from "../utils/work-items-custom-columns.util";
import { PayloadTableHeading } from "./TableHeading";
import { WorkItemBulkActions } from "./WorkItemBulkActions";
import { workItemsTableColumns } from "./WorkItemsTableColumns";

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
  const { columnVisibility, sortState } = getDataTablePreferences(tableKey, columnVisibilityState);

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

  const viewColumnNames = useMemo(
    () => [
      ...columnDisplayNames,
      ...customFields.map((field) => ({
        key: customColumnId(field),
        value: customFieldLabel(field),
      })),
    ],
    [customFields],
  );

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

  const filteredColumns = useMemo(() => {
    const columns = workItemsTableColumns(name, customFields, tableKey);
    if (!hasOnlyReadAccess) return columns;

    return columns.filter((column) => column.id !== "actions");
  }, [customFields, hasOnlyReadAccess, name, tableKey]);

  // Create a React table for WorkItems data
  const table = useDataTable(filteredColumns, rows, columnVisibility, sortState, true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading queueName={data?.data[0]?.queueName || name} />
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={searchColumns} placeholder="Search..." />
              <DTViewOptions {...{ table, tableKey }} columnDisplayNames={viewColumnNames} />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={filteredColumns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />
          {/* Bulk actions for selected work items (edit access only) */}
          {!hasOnlyReadAccess && <WorkItemBulkActions table={table} />}
        </div>
      ) : (
        // Show data table skeleton while fetching the WorkItems data
        <DataTableSkeleton />
      )}
    </>
  );
};
