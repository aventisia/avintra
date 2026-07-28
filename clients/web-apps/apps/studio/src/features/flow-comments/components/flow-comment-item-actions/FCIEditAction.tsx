import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

interface FCIEditActionProps {
  flowCommentId: string;
}

/**
 * Renders the edit action for a flow comment item.
 * This component displays a dropdown menu item with a edit button.
 */
export const FCIEditAction: React.FC<FCIEditActionProps> = ({
  flowCommentId,
}) => {
  // Get store state and actions
  const { setFlowCommentId } = useFlowCommentsStore(
    useShallow((state) => ({
      setFlowCommentId: state.setFlowCommentId,
    })),
  );

  return (
    <SimpleDDMenuItem
      size="sm"
      Icon={PencilSquareIcon}
      content="Edit"
      onClick={() => {
        setFlowCommentId(flowCommentId);
      }}
    />
  );
};
