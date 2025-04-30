import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { QueueCreateUpdateDto } from "../../dtos/queue-create-update-dto";
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
    boolean | QueueCreateUpdateDto,
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
