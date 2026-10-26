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
import { PayloadTableHeading } from "./TableHeading";
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

  // Get data-table preferences from local storage (persisted column visibility,
  // including the optional Source Work Item Id / Retry columns).
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch WorkItems data
  const { data } = useFetchQueuesWorkItems();

  // The work items screen is reachable from both the Personal and the Shared
  // queues tab, so the queue must be resolved against both lists.
  const { data: queuesData, isLoading } = useFetchAllQueues();

  const queue = useMemo(
    () => queuesData?.data?.find((item) => item.id === queueId),
    [queuesData?.data, queueId],
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
    if (!hasOnlyReadAccess) return workItemsTableColumns(name);

    return workItemsTableColumns(name).filter((column) => column.id !== "actions");
  }, [hasOnlyReadAccess, name]);

  // Create a React table for WorkItems data
  const table = useDataTable(filteredColumns, data?.data || [], columnVisibility, sortState, true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading queueName={data?.data[0]?.queueName || name} />
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["id"]} placeholder="Search..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
            </div>
          </div>
          {/* Data table to render data */}
          <DataTable table={table} columnsLength={filteredColumns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the WorkItems data
        <DataTableSkeleton />
      )}
    </>
  );
};
