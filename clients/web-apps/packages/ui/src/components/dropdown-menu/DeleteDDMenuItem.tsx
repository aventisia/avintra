import { Trash2 } from "lucide-react";
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
        "text-bad focus:bg-hover focus:text-bad data-[highlighted]:bg-hover data-[highlighted]:text-bad",
        size === "sm" && "group h-7 !px-[0.3rem] text-xs",
        size === "md" && "group h-auto min-h-[30px] gap-2 border-0 py-[5px]",
        className,
      )}
      {...props}
    >
      <Trash2
        className={cn(
          "shrink-0 text-bad",
          size === "sm" && "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
        )}
      />
      Delete
    </DropdownMenuItem>
  );

  return <LockedActionTooltip className="w-full">{item}</LockedActionTooltip>;
});
