import {
  FlowCommentDto,
  FCIAvatar,
  FCIHeader,
  FCIMessage,
} from "@/features/flow-comments";
import { cn } from "@/react-toolkit/lib";
import { memo } from "react";

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
  // Return the flow comment item
  return (
    <div
      className={cn(
        "flex w-full gap-3.5 px-3.5 py-2.5 leading-[1.1rem]",
        index > 0 && "border-t",
      )}
    >
      {/* PENDING: User avatar who created the flow comment */}
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
