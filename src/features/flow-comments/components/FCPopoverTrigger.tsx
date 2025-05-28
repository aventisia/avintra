import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@aventisia/ui/popover";
// import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { FC_POPOVER_HEADING } from "../constants/constatns";
import { useFlowCommentsStore } from "../stores/flow-comments-store";
import { MessageCircleMoreIcon } from "lucide-react";

/**
 * Renders a popover trigger component for flow comments.
 */
export const FCPopoverTrigger = () => {
  // Get store state and actions
  const { togglePopoverOpen } = useFlowCommentsStore(
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
        )}
        onClick={() => togglePopoverOpen}
      >
        <MessageCircleMoreIcon className="h-4 w-4 text-primary-foreground" />
      </PopoverTrigger>
    </Tooltip>
  );
};
