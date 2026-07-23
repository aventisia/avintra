import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface QueueRowDeleteActionProps {
  rowId: string;
}

export const QueueRowDeleteAction = ({ rowId }: QueueRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the queue
  const { mutate: deleteQueue } = useListOptimisticMutation<
    string,
    boolean | QueuesTableDto,
    QueuesTableDto
  >([rowId], queueOptimisticMutationFn, queryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteQueue({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "queue",
        });
      }}
    />
  );
};
