import { Popover, PopoverContent } from "@/react-toolkit/ui/popover";
import React from "react";
import { NodeSelectorContent } from "./node-selector-content";

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
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
        <NodeSelectorContent />
      </PopoverContent>
    </Popover>
  );
};
