import { cn } from "@/react-toolkit/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover/Popover";
import { useShallow } from "zustand/react/shallow";
import { FC_POPOVER_HEADING } from "../constants/constatns";
import { useDefineCreateCommentForm } from "../hooks/useDefineCreateCommentForm";
import { useFlowCommentsQueryKey } from "../hooks/useFlowCommentsQueryKey";
import { useFlowCommentsStore } from "../stores/flow-comments-store";
import { FCMessageComposer } from "./FCMessageComposer";
import { FCPopoverTrigger } from "./FCPopoverTrigger";
import { FCPopoverContent } from "./popover-content/FCPopoverContent";

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
