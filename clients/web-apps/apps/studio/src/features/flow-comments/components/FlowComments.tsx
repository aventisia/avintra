import { cn } from "@avplatform/ui/lib";
import { PopoverContent, PopoverDefaultHeader } from "@avplatform/ui/popover";
import { PopoverWrapper } from "@avplatform/ui/popover";
import { useShallow } from "zustand/react/shallow";

import { FC_POPOVER_HEADING } from "../constants/constatns";
import { useDefineCreateCommentForm } from "../hooks/useDefineCreateCommentForm";
import { useFlowCommentsQueryKey } from "../hooks/useFlowCommentsQueryKey";
import { useFlowCommentsStore } from "../stores/flow-comments-store";
import { FCMessageComposer } from "./FCMessageComposer";
import { FCPopoverTrigger } from "./FCPopoverTrigger";
import { FlowCommentsPopoverContent } from "./flow-comments-popover-content";

interface FlowCommentsProps {
  /** Additional class name to override popover content container style */
  className?: string;
}

export const FlowComments = ({ className }: FlowCommentsProps) => {
  // Get store state and actions
  const { isCreateFormDirty, isEditFormDirty, isPopoverOpen, togglePopoverOpen } =
    useFlowCommentsStore(
      useShallow((state) => ({
        isCreateFormDirty: state.isCreateFormDirty,
        isEditFormDirty: state.isEditFormDirty,
        isPopoverOpen: state.isPopoverOpen,
        togglePopoverOpen: state.togglePopoverOpen,
      })),
    );

  // Set flow comments query key and flowId in store
  useFlowCommentsQueryKey();

  // Define create comment form
  const { form } = useDefineCreateCommentForm();

  // Return Flow Comments Popover
  return (
    <PopoverWrapper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
      isFormDirty={isCreateFormDirty || isEditFormDirty}
    >
      {/* Custom flow comments popover trigger */}
      <FCPopoverTrigger />
      {/* Popover content */}
      <PopoverContent align="end" variant={"responsive"} className={cn(className)}>
        {/* Popover default header */}
        <PopoverDefaultHeader heading={FC_POPOVER_HEADING} />
        {/* Flow comments list */}
        <FlowCommentsPopoverContent />
        {/* Message Composer */}
        <FCMessageComposer form={form} crudAction="create" className="mx-3.5 my-3.5" />
      </PopoverContent>
    </PopoverWrapper>
  );
};
