import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";

import { FlowCommentItemActions } from "../flow-comment-item-actions";
import { FCIAvatar } from "./FCIAvatar";
import { FCIHeader } from "./FCIHeader";
import { FCIMessage } from "./FCIMessage";

interface FlowCommentItemProps {
  /** Index of the flow comment item in the list */
  index: number;

  /** flow comment data */
  data: FlowCommentDto;
}

/**
 * Renders a single flow comment item.
 *
 * @param {number} props.index - Index of the flow comment item in the list.
 * @param {Object} props.data - The data of the flow comment item.
 * @returns {JSX.Element} The rendered FlowCommentItem component.
 */
export const FlowCommentItem = memo(({ index, data }: FlowCommentItemProps) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Return the flow comment item
  return (
    <div
      className={cn(
        "group relative flex w-full gap-3.5 px-3.5 py-2.5 leading-[1.1rem]",
        index > 0 && "border-t",
      )}
    >
      {/* Show flow comment action buttons if comment belong to user */}
      {userSession?.email === data.userName && <FlowCommentItemActions flowCommentId={data.id} />}

      {/* TODO: User avatar who created the flow comment */}
      <FCIAvatar />

      {/* Flow comment container for comment, time etc */}
      <div className="mr-2 flex w-full flex-col gap-1">
        {/* User full name and Time */}
        <FCIHeader data={data} />

        {/* Message */}
        <FCIMessage data={data} />
      </div>
    </div>
  );
});
