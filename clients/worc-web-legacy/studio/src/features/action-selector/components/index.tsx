import { StopPropagationWrapper } from "@aventisia/ui";
import { DialogWrapper } from "@aventisia/ui/dialog";
import { DialogContent } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionSelectorContent } from "./ActionSelectorContent";

/**
 * Renders the Node Selector (to add nodes to flow).
 */
export const NodeSelector = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
  const { showDialog, setShowDialog } = useNodeSelectorStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <StopPropagationWrapper className="flex">
      <DialogWrapper
        open={showDialog}
        onOpenChangeFn={() => setShowDialog(!showDialog)}
      >
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
      </DialogWrapper>
    </StopPropagationWrapper>
  );
};
