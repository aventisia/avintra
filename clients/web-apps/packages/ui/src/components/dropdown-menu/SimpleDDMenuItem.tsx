import React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { DropdownMenuItem } from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

export const SimpleDDMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    content?: string;
    Icon?: React.ComponentType<IconProps>;
    size?: "sm" | "md";
  }
>(({ className, content, children, Icon, size = "md", ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className={cn(
      buttonVariants({ variant: "dropdownItem" }),
      size === "sm" && "h-7 !px-[0.3rem] text-xs",
      size === "md" && "h-8",
      className,
    )}
    {...props}
  >
    {Icon ? (
      <Icon
        className={cn(
          "text-[--icon-color]",
          size === "sm" && "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
        )}
      />
    ) : null}
    {content}
    {children}
  </DropdownMenuItem>
));
