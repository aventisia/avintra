import {
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";
import { ChevronDownIcon } from "lucide-react";

/**
 * CustomChevronDownIcon component.
 * Renders a customized ChevronDownIcon with dynamic styling based on the popover state.
 */
export const FPTChevronDownIcon = () => {
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
