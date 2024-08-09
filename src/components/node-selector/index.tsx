import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import React from "react";
import { NodeSelectorContent } from "./NodeSelectorContent";
import { NodeSelectorOriginType } from "./node-selector-origin-type";

interface NodeSelectorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Origin from where node selector popover is placed and triggered */
  origin: NodeSelectorOriginType;
  children: React.ReactNode;
}

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({ origin, children, ...props }: NodeSelectorProps) => {
  return (
    <Popover>
      {/* Custom trigger basis trigger location */}
      {children}
      {/* Popover content */}
      <PopoverContent
        align="start"
        side="right"
        variant={"responsive"}
        {...props}
      >
        {/* Node selector content */}
        <NodeSelectorContent origin={origin} />
      </PopoverContent>
    </Popover>
  );
};
