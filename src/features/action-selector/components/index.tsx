import { Popover, PopoverContent } from "@/react-toolkit/ui/popover";
import React from "react";
import { ActionSelectorContent } from "./ActionSelectorContent";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
  return (
    <StopPropagationWrapper className="flex">
      <Popover>
        {/* Custom trigger basis trigger location */}
        {children}
        {/* Popover content */}
        <PopoverContent
          collisionPadding={10}
          align="start"
          side="right"
          variant={"responsive"}
          className="mlg:h-[30rem]"
          {...props}
        >
          {/* Node selector content */}
          <ActionSelectorContent />
        </PopoverContent>
      </Popover>
    </StopPropagationWrapper>
  );
};
