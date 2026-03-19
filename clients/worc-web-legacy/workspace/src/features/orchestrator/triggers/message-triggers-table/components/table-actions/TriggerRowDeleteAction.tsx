import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { TimeTriggerDto } from "../../dtos/message-trigger-dto";

interface TriggerRowDeleteActionProps {
  rowId: string;
}

export const TriggerRowDeleteAction = ({
  rowId,
}: TriggerRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the trigger
  const { mutate: deleteTrigger } = useListOptimisticMutation<
    string,
    TimeTriggerDto | boolean,
    TimeTriggerDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteTrigger({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "trigger",
        });
      }}
    />
  );
};
