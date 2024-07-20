import {
  useFlowCommentsStore,
  FC_POPOVER_HEADING,
} from "@/features/flow-comments";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";
import {
  PopoverTrigger,
  Tooltip,
  buttonVariants,
} from "@/react-toolkit/components/ui";

/**
 * Renders a popover trigger component for flow comments.
 */
export const FCPopoverTrigger = () => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useFlowCommentsStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  return (
    <Tooltip content={FC_POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          isPopoverOpen && "hidden bg-slate-100 mlg:flex",
        )}
        onClick={() => togglePopoverOpen}
      >
        <ChatBubbleBottomCenterTextIcon className="h-[1.1rem] w-[1.1rem] text-[--icon-color]" />
      </PopoverTrigger>
    </Tooltip>
  );
};
