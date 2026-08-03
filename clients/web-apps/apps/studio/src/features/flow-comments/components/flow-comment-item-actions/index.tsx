import { DropdownMenu } from "@avplatform/ui/dropdown-menu";
import { DropdownMenuContent } from "@avplatform/ui/dropdown-menu";

import { FCIActionsTrigger } from "./FCIActionsTrigger";
import { FCIDeleteAction } from "./FCIDeleteAction";
import { FCIEditAction } from "./FCIEditAction";

interface FlowCommentItemActionsProps {
  /** flow comment's record id */
  flowCommentId: string;
}

/**
 * Represents the actions component for a flow comment item.
 * This component provides options to edit or delete the flow comment.
 */
export const FlowCommentItemActions: React.FC<FlowCommentItemActionsProps> = ({
  flowCommentId,
}) => {
  // Return the component
  return (
    // Comment actions menu
    <DropdownMenu>
      {/* Comment actions trigger */}
      <FCIActionsTrigger />

      {/* Comment actions menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        {/* Comment edit action */}
        <FCIEditAction flowCommentId={flowCommentId} />

        {/* Comment delete action */}
        <FCIDeleteAction flowCommentId={flowCommentId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
