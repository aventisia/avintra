import { flowCommentOptimisticMutationFn } from "@/features/flow-comments/apis/flow-comments-apis";
import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { AlertDialog as DeleteAlertDialogRoot } from "@/react-toolkit/ui/alert-dialog";
import { ConfirmActionAlert } from "@/react-toolkit/ui/custom/ConfirmActionAlert";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/react-toolkit/ui/dropdown-menu";
import { useShallow } from "zustand/react/shallow";
import { FCIActionsTrigger } from "./FCIActionsTrigger";
import { FCIDeleteAction } from "./FCIDeleteAction";
import { FCIEditAction } from "./FCIEditAction";

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
      <ConfirmActionAlert
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
