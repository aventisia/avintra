import React from "react";
import { ActionSelectorContent } from "./ActionSelectorContent";
import { StopPropagationWrapper } from "@aventisia/ui";
import { Dialog } from "@aventisia/ui/dialog";
import { DialogContent } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
  return (
    <StopPropagationWrapper className="flex">
      <Dialog>
        {/* Custom trigger basis trigger location */}
        {children}
        {/* Popover content */}
        <DialogContent
          side="right"
          {...props}
          className={cn(
            "right-2 mt-[calc(var(--header-height)+2*var(--header-padding))] h-[calc(100vh-var(--header-height)-3*var(--header-padding))] !max-w-[32rem] rounded-e-xl",
            "!max-w-[45rem]",
          )}
        >
          {/* Node selector content */}
          <ActionSelectorContent />
        </DialogContent>
      </Dialog>
    </StopPropagationWrapper>
  );
};
