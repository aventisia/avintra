import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { runReviewOptimisticMutationFn } from "../../apis/run-review-table-apis";
import { RUN_REIVEW_TABLE_QUERY_KEY } from "../../constants";
import { RunReviewTableDTO } from "../../dtos/run-review-table-dto";

interface RunReviewRowDeleteActionProps {
  rowId: string;
}

export const RunReviewRowDeleteAction = ({
  rowId,
}: RunReviewRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the record
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    RunReviewTableDTO | boolean,
    RunReviewTableDTO
  >([rowId], runReviewOptimisticMutationFn, RUN_REIVEW_TABLE_QUERY_KEY);

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
