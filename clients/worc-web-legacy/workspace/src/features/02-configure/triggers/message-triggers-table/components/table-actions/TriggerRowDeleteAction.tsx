import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { MessageTriggerDto } from "../../dtos/message-trigger-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface TriggerRowDeleteActionProps {
  rowId: string;
}

export const TriggerRowDeleteAction = ({
  rowId,
}: TriggerRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the trigger
  const { mutate: deleteTrigger } = useListOptimisticMutation<
    string,
    MessageTriggerDto | boolean,
    MessageTriggerDto
  >([rowId], triggerOptimisticMutationFn, queryKey);

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
