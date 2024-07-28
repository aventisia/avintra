import { cn } from "@/react-toolkit/lib/utils";
import {
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover/Popover";
import { PopoverWraper } from "@/react-toolkit/ui/popover/PopoverWraper";
import { useShallow } from "zustand/react/shallow";
import { useFlowsQueryKey } from "../hooks/useFlowsQueryKey";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";
import { FlowsPopoverContent } from "./content/FlowsPopoverContent";
import { FlowCrudDialog } from "./crud-dialog/FlowCrudDialog";
import { FPCreateButton } from "./FPCreateButton";
import { FPHeading } from "./FPHeading";
import { FlowsPopoverTrigger } from "./trigger/FlowsPopoverTrigger";

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

  // Set flows query key, projectId in store
  useFlowsQueryKey();

  // Return Popover
  return (
    <PopoverWraper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
    >
      {/* Custom flows popover trigger */}
      <FlowsPopoverTrigger />
      {/* Popover content */}
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className)}
        {...props}
      >
        {/* Flows popover custom header */}
        <PopoverDefaultHeader heading={<FPHeading />} className="border-none">
          <FPCreateButton />
        </PopoverDefaultHeader>
        {/* Crud Dialog for flow crud operation */}
        <FlowCrudDialog>
          <FlowsPopoverContent />
        </FlowCrudDialog>
      </PopoverContent>
    </PopoverWraper>
  );
};
