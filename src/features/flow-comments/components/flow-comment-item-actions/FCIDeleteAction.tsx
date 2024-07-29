import { flowCommentOptimisticMutationFn } from "@/features/flow-comments/apis/flow-comments-apis";
import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/drop-down/DeleteDDMenuItem";
import { useShallow } from "zustand/react/shallow";

interface FCIDeleteActionProps {
  flowCommentId: string;
}

/**
 * Renders the delete action for a flow comment item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FCIDeleteAction = ({ flowCommentId }: FCIDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

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
  >(flowCommentOptimisticMutationFn, fcQueryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the flow comment
              deleteFlowComment({
                id: flowCommentId,
                payload: flowCommentId,
                crudAction: "delete",
              });
            },
          },
          "comment",
        );
      }}
    />
  );
};
