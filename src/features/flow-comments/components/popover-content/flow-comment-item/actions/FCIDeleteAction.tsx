import { flowCommentOptimisticMutationFn } from "@/features/flow-comments/apis/flow-comments-apis";
import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
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
  const { showAlertDialog } = useShowAlertHandler();

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
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        showAlertDialog({
          confirmActionFn: () => {
            // Delete the flow comment
            deleteFlowComment({
              id: flowCommentId,
              payload: flowCommentId,
              crudAction: "delete",
            });
          },
          title: "Delete comment",
          description:
            "This action cannot be undone. Are you sure you want to delete this comment?",
          confirmBtnText: "Yes, delete comment",
        });
      }}
    >
      <TrashIcon className="mb-[2px] h-3.5 w-3.5 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
