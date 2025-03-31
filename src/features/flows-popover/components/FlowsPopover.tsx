import { cn } from "@/react-toolkit/lib/utils";
import {
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover";
import { PopoverWrapper } from "@/react-toolkit/ui/popover/PopoverWrapper";
import { useShallow } from "zustand/react/shallow";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";
import { FlowCrudDialog } from "./flow-crud-dialog";
import { FlowsPopoverContent } from "./flows-popover-content";
import { FPCreateButton } from "./FPCreateButton";
import { FPHeading } from "./FPHeading";
import { FlowsPopoverTrigger } from "./flows-popover-trigger";

export const FlowsPopover = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Return Popover
  return (
    <PopoverWrapper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
    >
      {/* Custom flows popover trigger */}
      <FlowsPopoverTrigger />
      {/* Popover content */}
      <PopoverContent
        align="start"
        variant={"responsive"}
        className={cn(className)}
        {...props}
      >
        {/* Crud Dialog for flow crud operation */}
        <FlowCrudDialog>
          {/* Flows popover custom header */}
          <PopoverDefaultHeader heading={<FPHeading />} className="border-none">
            <FPCreateButton />
          </PopoverDefaultHeader>
          <FlowsPopoverContent />
        </FlowCrudDialog>
      </PopoverContent>
    </PopoverWrapper>
  );
};
