import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { knowledgeBaseOptimisticMutationFn } from "../../apis/knowledge-base-apis";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface KBRowDeleteActionProps {
  rowId: string;
}

export const KBRowDeleteAction = ({ rowId }: KBRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the config
  const { mutate: deleteKnowledgeBase } = useListOptimisticMutation<
    string,
    KnowledgeBaseTableDto | boolean,
    KnowledgeBaseTableDto
  >([rowId], knowledgeBaseOptimisticMutationFn, queryKey);

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
