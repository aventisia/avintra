import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";

import { ExecutionOptimisticMutationFn } from "../../apis/executions-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { ExecutionsTableDto } from "../../dtos/executions-table-dto";

interface ExecutionRowDeleteActionProps {
  rowId: string;
}

export const ExecutionRowDeleteAction = ({
  rowId,
}: ExecutionRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the queue
  const { mutate: deleteExecution } = useListOptimisticMutation<
    string,
    ExecutionsTableDto | boolean,
    ExecutionsTableDto
  >([rowId], ExecutionOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteExecution({
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
