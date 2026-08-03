import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { FlowCommentDto } from "@/features/flow-comments/dtos/flow-comment-dto";
import { useDefineEditCommentForm } from "@/features/flow-comments/hooks/useDefineEditCommentForm";
import { useFlowCommentsStore } from "@/features/flow-comments/stores/flow-comments-store";

import { FCMessageComposer } from "../FCMessageComposer";

interface FCIMessageProps {
  /** flow comment record data */
  data: FlowCommentDto;
}

/**
 * Renders a flow comment text or message composer to edit comment.
 */
export const FCIMessage = memo(({ data }: FCIMessageProps) => {
  const { flowCommentId } = useFlowCommentsStore(
    useShallow((state) => ({
      flowCommentId: state.flowCommentId,
    })),
  );

  // Define create comment form
  const { form } = useDefineEditCommentForm();

  return (
    <>
      {data.id === flowCommentId ? (
        <FCMessageComposer form={form} crudAction="update" className="mx-0 my-1 w-full" />
      ) : (
        <p className="flex items-center text-xs tracking-wide text-foreground">{data.comment}</p>
      )}
    </>
  );
});
