import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { modelOptimisticMutationFn } from "../../apis/model-library-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { ModelLibraryTableDto } from "../../dtos/model-library-table-dto";

interface ModelRowDeleteActionProps {
  rowId: string;
}

export const ModelRowDeleteAction = ({ rowId }: ModelRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    ModelLibraryTableDto | boolean,
    ModelLibraryTableDto
  >([rowId], modelOptimisticMutationFn, DATA_QUERY_KEY);

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
