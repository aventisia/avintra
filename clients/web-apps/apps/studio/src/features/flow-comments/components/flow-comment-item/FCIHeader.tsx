import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { DotSeparator } from "@avplatform/ui";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";

interface FCIHeaderProps {
  /** flow comment record data */
  data: FlowCommentDto;
}

/**
 * Renders a flow comment header. This component contains the user full name and the time since the comment was created.
 */
export const FCIHeader = memo(({ data }: FCIHeaderProps) => {
  // Format the time since the flow comment was created
  const formattedTime = formatDistanceToNow(data.createdOn || new Date(), {
    addSuffix: true,
  });

  // Return the flow comment item
  return (
    <>
      {/* User full name and Time container */}
      <div className="flex w-[15rem] items-center">
        {/* User full name */}
        <span className="truncate text-xs font-medium text-foreground">
          {data.userFullName}
        </span>

        {/* Dot separator */}
        <DotSeparator />

        {/* Date and time */}
        <span
          title={`${formattedTime} ${data.isEdited && "(edited)"}`}
          className="truncate text-2xs text-muted-foreground"
        >
          {formattedTime} {data.isEdited && `(edited)`}
        </span>
      </div>
    </>
  );
});
