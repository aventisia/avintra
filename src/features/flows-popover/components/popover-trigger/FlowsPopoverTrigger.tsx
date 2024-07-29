import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover/Popover";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
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
        "group mr-1 flex h-8 max-w-[15rem] gap-1.5 bg-slate-50 px-3",
        isPopoverOpen && "bg-slate-100",
      )}
    >
      {isFlowLoading ? <FPTLoadingFlow /> : <FPTNameAndVersion />}
      <FPTChevronDownIcon />
    </PopoverTrigger>
  );
};
