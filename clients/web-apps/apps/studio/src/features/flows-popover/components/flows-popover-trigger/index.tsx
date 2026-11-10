import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useFlowsPopoverStore } from "../../stores/flows-popover-store";
import { FPTChevronDownIcon } from "./FPTChevronDownIcon";
import { FPTLoadingFlow } from "./FPTLoadingFlow";
import { FPTNameAndVersion } from "./FPTNameAndVersion";

/**
 * Renders a popover trigger component for flows list.
 */
export const FlowsPopoverTrigger = () => {
  // Get store state and actions
  const { isPopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
    })),
  );

  // Get global store state and actions
  const { isFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      isFlowLoading: state.isFlowLoading,
    })),
  );

  return (
    <PopoverTrigger
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "group flex h-full max-w-[15rem] gap-1.5 px-3",
        isPopoverOpen && "bg-hover",
      )}
    >
      {isFlowLoading ? <FPTLoadingFlow /> : <FPTNameAndVersion />}
      <FPTChevronDownIcon />
    </PopoverTrigger>
  );
};
