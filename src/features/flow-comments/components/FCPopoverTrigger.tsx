import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
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
          isPopoverOpen && "hidden bg-slate-100 mlg:flex",
        )}
        onClick={() => togglePopoverOpen}
      >
        <ChatBubbleBottomCenterTextIcon className="h-[1.1rem] w-[1.1rem] text-[--icon-color]" />
      </PopoverTrigger>
    </Tooltip>
  );
};
