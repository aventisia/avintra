import React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { ContextMenuItem, ContextMenuShortcut } from "@/ui/components/context-menu";
import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

export const SimpleCMItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuItem> & {
    content: string;
    Icon?: React.ComponentType<IconProps>;
    shortCut?: string;
    size?: "sm" | "md";
  }
>(({ className, content, Icon, shortCut, size = "md", ...props }, ref) => (
  <ContextMenuItem
    ref={ref}
    className={cn(
      buttonVariants({ variant: "dropdownItem" }),
      "gap-2",
      size === "sm" && "h-8 !px-[0.5rem] text-xs",
      size === "md" && "h-8",
      className,
    )}
    {...props}
  >
    {Icon && (
      <Icon
        className={cn(
          "shrink-0 text-muted-foreground",
          size === "sm" && "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
        )}
      />
    )}
    {content}
    {shortCut && <ContextMenuShortcut>{shortCut}</ContextMenuShortcut>}
  </ContextMenuItem>
));
