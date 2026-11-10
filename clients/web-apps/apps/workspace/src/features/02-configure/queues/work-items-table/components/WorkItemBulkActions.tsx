import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";
import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "@/stores/environment-store";

import { workItemsOptimisticMutationFn } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { WorkItemsTableRow } from "../utils/work-items-custom-columns.util";

type WorkItemBulkActionsProps = {
  table: Table<WorkItemsTableRow>;
};

export function WorkItemBulkActions({ table }: Readonly<WorkItemBulkActionsProps>) {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // IMPORTANT NOTE: build the full list query key (qid, env) so the optimistic
  // update targets the cached page instead of a key no query uses.
  const { qid = "" } = useParams();
  const env = useEnvironmentStore((state) => state.env);
  const queryKey = [...DATA_QUERY_KEY, qid, env];

  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  const { mutate: deleteWorkItems } = useListOptimisticMutation<
    string[],
    QueueWorkItemDto | boolean,
    QueueWorkItemDto
  >(selectedRowIds, workItemsOptimisticMutationFn, queryKey);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <TableCNActionBarItem
        icon={TrashIcon}
        tone="destructive"
        onClick={() => {
          showDefaultAlertDialog({
            confirmActionFn: () => {
              deleteWorkItems({
                payload: selectedRowIds,
                crudAction: "delete-multiple",
              });

              table.toggleAllRowsSelected(false);
            },
            alertType: "delete-multiple",
            additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "work items" : "work item"}`,
          });
        }}
      >
        Delete
      </TableCNActionBarItem>
    </TableCNActionBar>
  );
}
