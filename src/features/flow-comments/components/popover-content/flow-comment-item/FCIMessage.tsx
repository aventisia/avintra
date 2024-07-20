import { FlowCommentDto } from "@/features/flow-comments";
import { memo } from "react";

interface FCIMessageProps {
  /** flow comment record data */
  data: FlowCommentDto;
}

/**
 * Renders a flow comment text or message composer to edit comment.
 */
export const FCIMessage = memo(({ data }: FCIMessageProps) => {
  return (
    <p className="flex items-center text-xs tracking-wide text-foreground">
      {data.comment}
    </p>
  );
});
