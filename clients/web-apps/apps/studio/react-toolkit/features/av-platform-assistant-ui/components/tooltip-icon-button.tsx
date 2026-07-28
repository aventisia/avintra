import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Slot } from "radix-ui";
import { ComponentPropsWithRef, forwardRef } from "react";

export type TooltipIconButtonProps = ComponentPropsWithRef<typeof Button> & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
  return (
    <Tooltip content={tooltip} side={side}>
      <Button
        variant="ghost"
        size="icon6"
        {...rest}
        className={cn("aui-button-icon size-6 p-1", className)}
        ref={ref}
      >
        <Slot.Slottable>{children}</Slot.Slottable>
        <span className="aui-sr-only sr-only">{tooltip}</span>
      </Button>
    </Tooltip>
  );
});

TooltipIconButton.displayName = "TooltipIconButton";
