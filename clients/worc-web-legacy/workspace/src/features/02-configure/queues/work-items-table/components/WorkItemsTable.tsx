import {
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useFetchQueues } from "../../queues-table/hooks/useFetchQueues";
import { TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
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
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);

  // Fetch WorkItems data
  const { data } = useFetchQueuesWorkItems();

  const { data: queuesData } = useFetchQueues();

  const queue = useMemo(
    () => queuesData?.data?.find((item) => item.id === queueId),
    [queuesData?.data, queueId],
  );

  const hasOnlyReadAccess = useMemo(() => {
    return queue?.accessLevel == "View";
  }, [queue?.accessLevel]);

  const filteredColumns = useMemo(() => {
    if (!hasOnlyReadAccess) return workItemsTableColumns;

    return workItemsTableColumns.filter((column) => column.id !== "actions");
  }, [hasOnlyReadAccess]);

  // Create a React table for WorkItems data
  const table = useDataTable(filteredColumns, data?.data || [], {}, [], true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading queueName={data?.data[0]?.queueName || ""} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={"id"}
                placeholder="Search..."
              />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
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
