import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";
import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "@/stores/environment-store";

import { workItemsOptimisticMutationFn } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";

type WorkItemBulkActionsProps = {
  table: Table<QueueWorkItemDto>;
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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}
