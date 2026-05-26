import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { QueuesTableDto } from "../../dtos/queues-table-dto";

interface QueueRowDeleteActionProps {
  rowId: string;
}

export const QueueRowDeleteAction = ({ rowId }: QueueRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the queue
  const { mutate: deleteQueue } = useListOptimisticMutation<
    string,
    boolean | QueuesTableDto,
    QueuesTableDto
  >([rowId], queueOptimisticMutationFn, DATA_QUERY_KEY);

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
