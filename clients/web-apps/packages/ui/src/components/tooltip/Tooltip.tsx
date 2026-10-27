import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/ui/lib";
import { type PositionType } from "@/ui/types";

const TooltipProvider = TooltipPrimitive.Provider;

// ------------------------------------------------------------------------------------------------

interface TooltipProps extends React.PropsWithChildren {
  /**
   * Trigger component - Hover on this component is going to open the tooltip.
   * It could be simple text or JSX
   */
  children: React.ReactNode;

  /** Tooltip content. It could be simple text or JSX */
  content: React.ReactNode;

  /**
   * (Optional): This property allows you to show a keyboard shortcut
   */
  shortcut?: string;

  /**
   * (Optional): This property controls the time delay (in milliseconds) before the
   * tooltip appears after hovering over the target element.
   * Default value is 400 milliseconds
   */
  delayDuration?: number;

  /**
   * (Optional): The preferred side of the anchor to render against when open.
   * Will be reversed when collisions occur. Default value is bottom.
   */
  side?: PositionType;

  /**
   * (Optional): To pass css classes to override TooltipContent container style
   */
  className?: string;
}

/** Radix ui's tooltip implementation */
const Tooltip = ({
  children,
  content,
  shortcut,
  delayDuration = 400,
  side = "bottom",
  className,
  ...props
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={4}
          className={cn(
            "z-50 max-w-[240px] overflow-hidden rounded-md bg-secondary px-2 py-[5px] text-hint font-medium text-secondary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          {content}
          {shortcut && (
            <span
              className={cn(
                typeof content === "string" && content.length > 0 ? "ml-2" : "",
                "font-mono text-secondary-foreground/60",
              )}
            >
              {shortcut}
            </span>
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export { Tooltip, TooltipProvider };
