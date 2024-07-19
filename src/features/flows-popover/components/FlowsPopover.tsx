import {
  FlowsPopoverContent,
  FlowsPopoverTrigger,
  FPCreateButton,
  FPHeading,
  useFlowsPopoverStore,
  useFlowsQueryKey,
  FlowCrudDialogContent,
} from "@/features/flows-popover";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
  Dialog as CrudDialogRoot,
} from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/react-toolkit/lib";
import { useDTCrudDialogStore } from "@/react-toolkit/components/data-table";

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

  // Get crud dialog store to show dialog state
  const {
    crudDialogOptions: { showDialog },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
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
        {/* Dialog root for flow crud operation */}
        <CrudDialogRoot
          open={showDialog}
          onOpenChange={() => setShowDialog(!showDialog)}
        >
          <FlowsPopoverContent />
          {/* Content of flow curd dialog for create, read, update actions */}
          <FlowCrudDialogContent />
        </CrudDialogRoot>
      </PopoverContent>
    </Popover>
  );
};
