import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { modelOptimisticMutationFn } from "../../apis/models-table-apis";
import { ModelsTableDto } from "../../dtos/models-table-dto";
import { useModelsTableStore } from "../../stores/models-table-store";
import { useShallow } from "zustand/react/shallow";

interface ModelRowDeleteActionProps {
  rowId: string;
}

export const ModelRowDeleteAction = ({ rowId }: ModelRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get models store state and actions
  const { modelsQueryKey } = useModelsTableStore(
    useShallow((state) => ({
      modelsQueryKey: state.modelsQueryKey,
    })),
  );

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    ModelsTableDto | boolean,
    ModelsTableDto
  >([rowId], modelOptimisticMutationFn, modelsQueryKey);

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
