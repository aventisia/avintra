import { IconProps } from "@/react-toolkit/types/icon-props";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { cn } from "@/react-toolkit/lib/utils";
import React from "react";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const SimpleDDMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    content: string;
    Icon?: React.ComponentType<IconProps>;
    size?: "sm" | "md";
  }
>(({ className, content, Icon, size = "md", ...props }, ref) => (
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
    {Icon && (
      <Icon
        className={cn(
          "text-[--icon-color]",
          size === "sm" && "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
        )}
      />
    )}
    {content}
  </DropdownMenuItem>
));
