import {
  FCIActionsTrigger,
  FCIDeleteAction,
  FCIEditAction,
  FlowCommentDto,
  flowCommentOptimisticMutationFn,
  useFlowCommentsStore,
} from "@/features/flow-comments";
import {
  DropdownMenu,
  DropdownMenuContent,
  ConfirmActionAlertContent,
  AlertDialog as DeleteAlertDialogRoot,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";

interface FCIActionsProps {
  /** flow comment's record id */
  flowCommentId: string;
}

/**
 * Represents the actions component for a flow comment item.
 * This component provides options to edit or delete the flow comment.
 */
export const FCIActions: React.FC<FCIActionsProps> = ({ flowCommentId }) => {
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

  // Return the component
  return (
    // Comment delete alert dialog root
    <DeleteAlertDialogRoot>
      {/* Comment actions menu */}
      <DropdownMenu>
        {/* Comment actions trigger */}
        <FCIActionsTrigger />

        {/* Comment actions menu content */}
        <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
          {/* Comment edit action */}
          <FCIEditAction flowCommentId={flowCommentId} />

          {/* Comment delete action */}
          <FCIDeleteAction />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Comment delete alert dialog */}
      <ConfirmActionAlertContent
        description="This action cannot be undone. Are you sure you want to delete this comment?"
        confirmText="Yes, delete comment"
        confirmActionFn={() => {
          // Delete the flow comment
          deleteFlowComment({
            id: flowCommentId,
            payload: flowCommentId,
            crudAction: "delete",
          });
        }}
      />
    </DeleteAlertDialogRoot>
  );
};
