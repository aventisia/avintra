import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

import { LockedActionTooltip, useActionLock } from "@/ui/components/action-lock";
import { buttonVariants } from "@/ui/components/buttons";
import { DropdownMenuItem } from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";

export const DeleteDDMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    size?: "sm" | "md";
  }
>(({ className, size = "md", disabled, ...props }, ref) => {
  const { locked } = useActionLock();

  const item = (
    <DropdownMenuItem
      ref={ref}
      disabled={disabled || locked}
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        size === "sm" && "group h-7 !px-[0.3rem] text-xs",
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
    </DropdownMenuItem>
  );

  return <LockedActionTooltip className="w-full">{item}</LockedActionTooltip>;
});
