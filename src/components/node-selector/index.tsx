import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import React from "react";
import { NodeSelectorContent } from "./NodeSelectorContent";
import { FlowControlsTrigger } from "./node-selector-triggers/FlowControlsTrigger";
import { OutputHandleTrigger } from "./node-selector-triggers/OutputHandleTrigger";

interface NodeSelectorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Origin from where node selector popover is placed and triggered */
  origin: "Closed" | "FlowControls" | "OutputHandle";
}

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({ origin, ...props }: NodeSelectorProps) => {
  return (
    <Popover>
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
