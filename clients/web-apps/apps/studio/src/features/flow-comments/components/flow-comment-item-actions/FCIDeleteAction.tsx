import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { flowCommentOptimisticMutationFn } from "@/features/flow-comments/apis/flow-comments-apis";
import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";

interface FCIDeleteActionProps {
  flowCommentId: string;
}

/**
 * Renders the delete action for a flow comment item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FCIDeleteAction = ({ flowCommentId }: FCIDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get flow comments store state and actions
  const { fcQueryKey } = useFlowCommentsStore(
    useShallow((state) => ({
      fcQueryKey: state.fcQueryKey,
    })),
  );

  // Get mutation function to delete the flow comment
  const { mutate: deleteFlowComment } = useListOptimisticMutation<
    string,
    FlowCommentDto | boolean,
    FlowCommentDto
  >([flowCommentId], flowCommentOptimisticMutationFn, fcQueryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteFlowComment({
              payload: flowCommentId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "comment",
        });
      }}
    />
  );
};
