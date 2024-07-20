import {
  FPTChevronDownIcon,
  FPTLoadingFlow,
  FPTNameAndVersion,
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";
import { PopoverTrigger, buttonVariants } from "@/react-toolkit/components/ui";
import { useCurrentFlowStore } from "@/stores";

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
