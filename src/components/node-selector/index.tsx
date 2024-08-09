import { Popover, PopoverContent } from "@/react-toolkit/ui/popover";
import React from "react";
import { NodeSelectorContent } from "./NodeSelectorContent";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";

interface NodeSelectorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Origin from where node selector popover is triggered */
  origin: NodeSelectorOriginType;
  /**
   * Node or edge id from where popover is triggered.
   * Node Id if triggered from PlaceholderNode
   * Edge Id if triggered from CustomStepEdge
   */
  originId: string;
  children: React.ReactNode;
}

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({
  origin,
  originId,
  children,
  ...props
}: NodeSelectorProps) => {
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
        <NodeSelectorContent origin={origin} originId={originId} />
      </PopoverContent>
    </Popover>
  );
};
