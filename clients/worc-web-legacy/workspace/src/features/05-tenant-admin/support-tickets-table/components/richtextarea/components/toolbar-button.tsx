import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import * as React from "react";

import { Toggle } from "./toggle";

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(({ isActive, children, tooltip, className, ...props }, ref) => {
  return (
    <Tooltip side="top" content={tooltip}>
      <Toggle
        size="sm"
        ref={ref}
        className={cn("size-8 p-0", { "bg-accent": isActive }, className)}
        {...props}
      >
        {children}
      </Toggle>
    </Tooltip>
  );
});

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
