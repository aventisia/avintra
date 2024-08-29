import * as React from "react";
import { Toggle } from "../components/toggle";
import { cn } from "@/react-toolkit/lib/utils";
import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: TooltipContentProps;
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
