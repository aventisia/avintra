import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { ContextMenuItem, ContextMenuShortcut } from "@/ui/components/context-menu";
import { cn } from "@/ui/lib";

export const DeleteCMItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuItem> & {
    size?: "sm" | "md";
  }
>(({ className, size = "md", ...props }, ref) => (
  <ContextMenuItem
    ref={ref}
    className={cn(
      buttonVariants({ variant: "dropdownCautionItem" }),
      "gap-2",
      size === "sm" && "group h-8 !px-[0.5rem] text-xs",
      size === "md" && "group h-8",
      className,
    )}
    {...props}
  >
    <TrashIcon
      className={cn(
        "mb-[2px] text-destructive group-focus:text-white",
        size === "sm" && "h-3.5 w-3.5",
        size === "md" && "h-4 w-4",
      )}
    />
    Delete
    <ContextMenuShortcut className="group-focus:text-white">DEL</ContextMenuShortcut>
  </ContextMenuItem>
));
