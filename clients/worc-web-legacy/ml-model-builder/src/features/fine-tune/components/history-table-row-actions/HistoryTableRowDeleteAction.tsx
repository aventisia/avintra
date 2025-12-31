import { ModelNamesEnum } from "@/features/pdf-previewer/enums/model-name-enum";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

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
  disabled?: boolean;
}

export const HistoryTableRowDeleteAction = ({
  rowId,
  disabled,
}: HistoryTableRowDeleteActionProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { data: modelData } = useFetchProjectMetaData();

  const modelName =
    ModelNamesEnum[modelData!.data.type as keyof typeof ModelNamesEnum];

  const { mutate: deleteModel } = useListOptimisticMutation<
    { id: string; modelName: string },
    HistoryTableDTO | boolean,
    HistoryTableDTO
  >([rowId], historyOptimisticMutationFn, HISTORY_TABLE_QUERY_KEY);

  return (
    <DeleteDDMenuItem
      disabled={disabled}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteModel({
              payload: { id: rowId, modelName },
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "history record",
        });
      }}
    />
  );
};
