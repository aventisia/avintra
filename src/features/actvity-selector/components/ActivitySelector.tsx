import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import { useShallow } from "zustand/react/shallow";
import { useActivitySelectorStore } from "../stores/activity-selector-store";
import { ActivitySelectorContent } from "./ActivitySelectorContent";

interface ActivitySelectorProps {
  /** The trigger element to open ActivitySelector popover. */
  trigger: React.ReactNode;
  alignOffset: number;
  sideOffset: number;
}

/**
 * Renders the Activity Selector (to add nodes to flow).
 *
 * @param {ReactNode} props.trigger - The trigger element to open ActivitySelector popover.
 */
export const ActivitySelector = ({
  trigger,
  alignOffset,
  sideOffset,
}: ActivitySelectorProps) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useActivitySelectorStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Return Popover
  return (
    <Popover open={isPopoverOpen} onOpenChange={togglePopoverOpen}>
      {/* Custom trigger basis trigger location */}
      {trigger}
      {/* Popover content */}
      <PopoverContent
        align="start"
        variant={"responsive"}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      >
        {/* Activity selector content */}
        <ActivitySelectorContent />
      </PopoverContent>
    </Popover>
  );
};
