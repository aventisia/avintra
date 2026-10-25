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
        "focus:bg-rose-50 focus:text-rose-600 data-[highlighted]:bg-rose-50 data-[highlighted]:text-rose-600",
        size === "sm" && "group h-7 !px-[0.3rem] text-xs",
        size === "md" && "group h-auto gap-2.5 border-0 !px-2.5 py-2 text-[13px] font-normal",
        className,
      )}
      {...props}
    >
      <TrashIcon
        className={cn(
          "mb-[2px] text-rose-500",
          size === "sm" && "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
        )}
      />
      Delete
    </DropdownMenuItem>
  );

  return <LockedActionTooltip className="w-full">{item}</LockedActionTooltip>;
});
