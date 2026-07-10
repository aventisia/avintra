import {
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { HorizontalScrollWrapper } from "@/react-toolkit/ui/HorizontalScrollWrapper";

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
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name") ?? "WorkItem";
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);
  const navigate = useNavigate();

  // Fetch WorkItems data
  const { data } = useFetchQueuesWorkItems();

  const { data: queuesData, isLoading } = useFetchQueues();

  const queue = useMemo(
    () => queuesData?.data?.find((item) => item.id === queueId),
    [queuesData?.data, queueId],
  );

  // if the KB does not exist in Queue list/shared revert user back to Queues page
  useEffect(() => {
    if (!isLoading && !queue) navigate("/configure/queues");
  }, [isLoading, queue]);

  const hasOnlyReadAccess = useMemo(() => {
    if (!queue) return true;
    return queue?.accessLevel == "View";
  }, [queue]);

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
            <PayloadTableHeading queueName={data?.data[0]?.queueName || name} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["id"]}
                placeholder="Search..."
              />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
            </div>
          </div>
          <HorizontalScrollWrapper>
            {/* Data table to render data */}
            <DataTable table={table} columnsLength={filteredColumns.length} />
          </HorizontalScrollWrapper>

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
