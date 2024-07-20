import {
  useFlowCommentsQueryKey,
  useFlowCommentsStore,
  FC_POPOVER_HEADING,
  FCPopoverTrigger,
  FCPopoverContent,
  FCMessageComposer,
  useDefineCreateCommentForm,
} from "@/features/flow-comments";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";

interface FlowCommentsProps {
  /** Additional class name to override popover content container style */
  className?: string;
}

export const FlowComments = ({ className }: FlowCommentsProps) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useFlowCommentsStore(
    useShallow((state) => ({
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
    <Popover open={isPopoverOpen} onOpenChange={togglePopoverOpen}>
      {/* Custom flow comments popover trigger */}
      <FCPopoverTrigger />
      {/* Popover content */}
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className)}
      >
        {/* Popover default header */}
        <PopoverDefaultHeader heading={FC_POPOVER_HEADING} />
        {/* Flow comments list */}
        <FCPopoverContent />
        {/* Message Composer */}
        <FCMessageComposer
          form={form}
          crudAction="create"
          className="mx-3.5 my-3.5"
        />
      </PopoverContent>
    </Popover>
  );
};
