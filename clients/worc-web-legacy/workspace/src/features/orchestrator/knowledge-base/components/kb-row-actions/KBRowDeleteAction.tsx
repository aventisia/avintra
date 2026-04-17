import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { knowledgeBaseOptimisticMutationFn } from "../../apis/knowledge-base-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";

interface KBRowDeleteActionProps {
  rowId: string;
}

export const KBRowDeleteAction = ({ rowId }: KBRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the config
  const { mutate: deleteKnowledgeBase } = useListOptimisticMutation<
    string,
    KnowledgeBaseTableDto | boolean,
    KnowledgeBaseTableDto
  >([rowId], knowledgeBaseOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteKnowledgeBase({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete",
          title: "Delete knowledge base?",
          description:
            "Are you sure you want to delete this knowledge base? This may affect any agent that uses it.",
        });
      }}
    />
  );
};
