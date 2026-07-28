import { cn } from "@avplatform/ui/lib";
import { buttonVariants } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { FC_POPOVER_HEADING } from "../constants/constatns";
import { useFlowCommentsStore } from "../stores/flow-comments-store";

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
          "hover:bg-white/10",
          isPopoverOpen && "hidden bg-white/10 mlg:flex",
        )}
        onClick={() => togglePopoverOpen}
      >
        <ChatBubbleBottomCenterTextIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
      </PopoverTrigger>
    </Tooltip>
  );
};
