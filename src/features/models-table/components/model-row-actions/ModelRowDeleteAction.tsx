import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { modelOptimisticMutationFn } from "../../apis/models-table-apis";
import { MODELS_QUERY_KEY } from "../../constants";
import { ModelsTableDto } from "../../dtos/models-table-dto";

interface ModelRowDeleteActionProps {
  rowId: string;
}

export const ModelRowDeleteAction = ({ rowId }: ModelRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    ModelsTableDto | boolean,
    ModelsTableDto
  >([rowId], modelOptimisticMutationFn, MODELS_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteModel({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "model",
        });
      }}
    />
  );
};
