import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { useFetchAllQueues } from "../../queues-table/hooks/useFetchQueues";
import { TABLE_KEY, WORK_ITEMS_INITIAL_STATE, WORK_ITEMS_PAGE_SIZE_OPTIONS } from "../constants";
import { useFetchQueuesWorkItems } from "../hooks/useFetchQueuesWorkItems";
import { PayloadTableHeading } from "./TableHeading";
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

  const columns = useMemo(() => {
    if (!hasOnlyReadAccess) return workItemsTableColumns(name);

    return workItemsTableColumns(name).filter((column) => column.id !== "actions");
  }, [hasOnlyReadAccess, name]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    initialState: WORK_ITEMS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["id"],
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
          <TableCN table={table} label={name} paginationProps={PAGINATION_PROPS}>
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
