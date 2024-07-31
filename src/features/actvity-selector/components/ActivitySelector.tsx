import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import {
  ActivitySelectorOriginType,
  useActivitySelectorStore,
} from "../stores/activity-selector-store";
import { ActivitySelectorContent } from "./ActivitySelectorContent";
import { FlowControlsTrigger } from "./triggers/FlowControlsTrigger";
import { OutputHandleTrigger } from "./triggers/OutputHandleTrigger";

interface ActivitySelectorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Origin from where activity selector popover is placed and triggered */
  origin: ActivitySelectorOriginType;
}

/**
 * Renders the Activity Selector (to add nodes to flow).
 *
 * @param {ReactNode} props.trigger - The trigger element to open ActivitySelector popover.
 */
export const ActivitySelector = ({
  origin,
  ...props
}: ActivitySelectorProps) => {
  // Get store state and actions
  const { popoverOrigin, togglePopoverOrigin } = useActivitySelectorStore(
    useShallow((state) => ({
      popoverOrigin: state.popoverOrigin,
      togglePopoverOrigin: state.togglePopoverOrigin,
    })),
  );

  // Return Popover
  return (
    <Popover
      open={popoverOrigin === origin}
      onOpenChange={(open) => {
        togglePopoverOrigin(open ? origin : "Closed");
      }}
    >
      {/* Custom trigger basis trigger location */}
      {origin === "FlowControls" && <FlowControlsTrigger />}
      {origin === "OutputHandle" && <OutputHandleTrigger />}
      {/* Popover content */}
      <PopoverContent align="start" variant={"responsive"} {...props}>
        {/* Activity selector content */}
        <ActivitySelectorContent />
      </PopoverContent>
    </Popover>
  );
};
