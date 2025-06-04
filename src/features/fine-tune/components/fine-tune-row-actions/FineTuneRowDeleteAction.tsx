import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

// import { useQueryClient } from "@tanstack/react-query";

import { runReviewOptimisticMutationFn } from "../../apis/fine-tune-table-apis";
import { FINE_TUNE_TABLE_QUERY_KEY } from "../../constants";
import { FineTuneTableDTO } from "../../dtos/fine-tune-table-dto";

interface FineTuneRowDeleteActionProps {
  rowId: string;
}

export const FineTuneRowDeleteAction = ({
  rowId,
}: FineTuneRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the record
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    FineTuneTableDTO | boolean,
    FineTuneTableDTO
  >([rowId], runReviewOptimisticMutationFn, FINE_TUNE_TABLE_QUERY_KEY);
  // const queryClient = useQueryClient();

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
          additionalText: "record",
        });
      }}
    />
  );
};
