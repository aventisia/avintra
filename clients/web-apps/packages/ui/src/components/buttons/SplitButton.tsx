import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";

const SIZE_CLASS_NAMES = {
  xs: { action: "gap-1.5", chevron: "size-3.5" },
  sm: { action: "gap-2", chevron: "size-4" },
  default: { action: "gap-2", chevron: "size-4" },
} as const;

const HALF_CLASS_NAME = "relative focus-visible:z-10 active:translate-y-0";

/** Props of {@link SplitButton}; native button props apply to the main action. */
export interface SplitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Dropdown content opened by the chevron, e.g. a `DropdownMenuContent`. */
  menu: ReactNode;
  /** Accessible name of the chevron. */
  menuLabel?: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
  /** Keyboard shortcut of the main action, shown in its tooltip. */
  shortcut?: string;
  /** Classes of the wrapping group. */
  className?: string;
}

/**
 * Primary button with a main action and a chevron that opens a menu of related actions.
 */
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      menu,
      menuLabel = "More options",
      size = "sm",
      shortcut,
      className,
      disabled,
      type = "button",
      children,
      ...actionProps
    },
    ref,
  ) => {
    const sizeClassNames = SIZE_CLASS_NAMES[size];

    const actionButton = (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        {...actionProps}
        className={cn(
          buttonVariants({ size }),
          HALF_CLASS_NAME,
          "rounded-r-none",
          sizeClassNames.action,
        )}
      >
        {children}
      </button>
    );

    return (
      <div role="group" className={cn("inline-flex", className)}>
        {shortcut ? (
          <Tooltip content="" shortcut={shortcut}>
            {actionButton}
          </Tooltip>
        ) : (
          actionButton
        )}
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label={menuLabel}
              className={cn(
                buttonVariants({ size }),
                HALF_CLASS_NAME,
                "group rounded-l-none px-2 data-[state=open]:bg-primary-hover",
                "before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-primary-foreground/30",
              )}
            >
              <ChevronDown
                className={cn(
                  sizeClassNames.chevron,
                  "transition-transform duration-200 group-data-[state=open]:rotate-180",
                )}
              />
            </button>
          </DropdownMenuPrimitive.Trigger>
          {menu}
        </DropdownMenuPrimitive.Root>
      </div>
    );
  },
);
SplitButton.displayName = "SplitButton";
