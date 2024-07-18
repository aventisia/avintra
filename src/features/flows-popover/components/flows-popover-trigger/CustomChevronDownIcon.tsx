import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";
import { useFlowsPopoverStore } from "../../stores/flows-popover-store";
import { ChevronDownIcon } from "lucide-react";

/**
 * CustomChevronDownIcon component.
 * Renders a customized ChevronDownIcon with dynamic styling based on the popover state.
 */
export const CustomChevronDownIcon = () => {
  // Get store state and actions
  const { isPopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
    })),
  );

  return (
    <ChevronDownIcon
      className={cn(
        "h-3 w-3 min-w-3 text-[--icon-color] transition-all group-hover:mt-1",
        isPopoverOpen && "mt-1",
      )}
    />
  );
};
