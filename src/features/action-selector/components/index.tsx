import React from "react";
import { ActionSelectorContent } from "./ActionSelectorContent";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent } from "@/react-toolkit/ui/dialog";

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
          className="h-full !max-w-[40rem]"
        >
          {/* Node selector content */}
          <ActionSelectorContent />
        </DialogContent>
      </Dialog>
    </StopPropagationWrapper>
  );
};
