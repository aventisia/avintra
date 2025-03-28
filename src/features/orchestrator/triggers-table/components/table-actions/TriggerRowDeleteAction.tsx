import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { TriggersTableDto } from "../../dtos/triggers-table-dto";

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
    TriggersTableDto | boolean,
    TriggersTableDto
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
