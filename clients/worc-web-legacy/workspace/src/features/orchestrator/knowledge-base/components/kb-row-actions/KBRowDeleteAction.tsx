import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";

interface KBRowDeleteActionProps {
  rowId: string;
}

export const KBRowDeleteAction = ({ rowId }: KBRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the config
  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    KnowledgeBaseTableDto | boolean,
    KnowledgeBaseTableDto
  >([rowId], keystoreOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteConfig({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete knowledgeBase",
          title: "Delete knowledgeBase?",
          description:
            "Are you sure you want to delete knowledgeBase? This may affect any agent that uses it.",
        });
      }}
    />
  );
};
