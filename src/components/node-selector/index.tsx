import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import {
  NodeSelectorOriginType,
  useNodeSelectorStore,
} from "@/stores/node-selector-store";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { NodeSelectorContent } from "./NodeSelectorContent";
import { FlowControlsTrigger } from "./node-selector-triggers/FlowControlsTrigger";
import { OutputHandleTrigger } from "./node-selector-triggers/OutputHandleTrigger";

interface NodeSelectorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Origin from where node selector popover is placed and triggered */
  origin: NodeSelectorOriginType;
}

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({ origin, ...props }: NodeSelectorProps) => {
  // Get store state and actions
  const { popoverOrigin, togglePopoverOrigin } = useNodeSelectorStore(
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
        {/* Node selector content */}
        <NodeSelectorContent />
      </PopoverContent>
    </Popover>
  );
};
