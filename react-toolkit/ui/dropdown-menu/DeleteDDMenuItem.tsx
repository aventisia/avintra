import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { cn } from "@/react-toolkit/lib/utils";
import React from "react";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { TrashIcon } from "@heroicons/react/24/outline";

export const DeleteDDMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    size?: "sm" | "md";
  }
>(({ className, size = "md", ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
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
));
