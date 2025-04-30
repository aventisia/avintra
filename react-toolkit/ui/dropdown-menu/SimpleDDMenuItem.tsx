import { cn } from "@/react-toolkit/lib/utils";
import { IconProps } from "@/react-toolkit/types/icon-props";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";

import React from "react";

import Lucide, { LucidIconName } from "../Lucide";

export const SimpleDDMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    content?: string;
    Icon?: React.ComponentType<IconProps>;
    lucidIconName?: LucidIconName;
    size?: "sm" | "md";
  }
>(
  (
    {
      className,
      content,
      children,
      Icon,
      lucidIconName,
      size = "md",
      ...props
    },
    ref,
  ) => (
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
      {(Icon && (
        <Icon
          className={cn(
            "text-[--icon-color]",
            size === "sm" && "h-3.5 w-3.5",
            size === "md" && "h-4 w-4",
          )}
        />
      )) ||
        (lucidIconName && (
          <Lucide
            icon={lucidIconName}
            className={cn(
              "text-[--icon-color]",
              size === "sm" && "h-3.5 w-3.5",
              size === "md" && "h-4 w-4",
            )}
          />
        ))}
      {content}
      {children}
    </DropdownMenuItem>
  ),
);
