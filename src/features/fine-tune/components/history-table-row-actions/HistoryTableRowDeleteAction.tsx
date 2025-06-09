import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { historyOptimisticMutationFn } from "../../apis/history-table-apis";
import { HISTORY_TABLE_QUERY_KEY } from "../../constants";
import { HistoryTableDTO } from "../../dtos/history-table-dto";

interface HistoryTableRowDeleteActionProps {
  rowId: string;
}

export const HistoryTableRowDeleteAction = ({
  rowId,
}: HistoryTableRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the record
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    HistoryTableDTO | boolean,
    HistoryTableDTO
  >([rowId], historyOptimisticMutationFn, HISTORY_TABLE_QUERY_KEY);

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
          additionalText: "history record",
        });
      }}
    />
  );
};
