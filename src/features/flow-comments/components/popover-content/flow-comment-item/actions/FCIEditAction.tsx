import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
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
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownItem" }),
        "h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        setFlowCommentId(flowCommentId);
      }}
    >
      <PencilSquareIcon className="h-3.5 w-3.5 text-[--icon-color]" />
      Edit
    </DropdownMenuItem>
  );
};
