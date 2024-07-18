import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { FlowsPopoverTrigger } from "../flows-popover-trigger/FlowsPopoverTrigger";
import { useFlowsPopoverStore } from "../../stores/flows-popover-store";
import { useFlowsQueryKey } from "../../hooks/useFlowsQueryKey";
import { FlowsPopoverContent } from "../flows-popover-content/FlowsPopoverContent";
import { cn } from "@/react-toolkit/lib";
import { FPCreateButton } from "./FPCreateButton";
import { FPHeading } from "./FPHeading";

interface FlowsPopoverProps {
  /** Additional class name to override popover content container style */
  className?: string;
}

export const FlowsPopover = ({ className }: FlowsPopoverProps) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Set flows query key, projectId in store
  useFlowsQueryKey();

  // Return Popover
  return (
    <Popover open={isPopoverOpen} onOpenChange={togglePopoverOpen}>
      {/* Custom flows popover trigger */}
      <FlowsPopoverTrigger />
      {/* Popover content */}
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className)}
      >
        {/* Flows popover custom header */}
        <PopoverDefaultHeader heading={<FPHeading />} className="border-none">
          <FPCreateButton />
        </PopoverDefaultHeader>
        {/* Flows list */}
        <FlowsPopoverContent />
      </PopoverContent>
    </Popover>
  );
};
