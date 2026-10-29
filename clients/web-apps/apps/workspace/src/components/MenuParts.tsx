import { cn } from "@avplatform/ui/lib";
import { DropdownMenu } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * Floating panel of a dropdown menu.
 */
export const MenuContent = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      sideOffset={6}
      {...props}
      className={cn(
        "z-50 min-w-36 overflow-hidden rounded-xl bg-popover p-1.5 shadow-pop ring-1 ring-line",
        "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className,
      )}
    />
  </DropdownMenu.Portal>
);

type MenuItemProps = ComponentProps<typeof DropdownMenu.Item> & { isDestructive?: boolean };

/**
 * Row of a dropdown menu; destructive rows turn rose.
 */
export const MenuItem = ({ className, isDestructive = false, ...props }: MenuItemProps) => (
  <DropdownMenu.Item
    {...props}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0",
      isDestructive
        ? "text-bad data-[highlighted]:bg-bad/10 [&>svg]:text-bad"
        : "text-ink-2 data-[highlighted]:bg-muted data-[highlighted]:text-ink [&>svg]:text-muted-foreground data-[highlighted]:[&>svg]:text-ink-2",
      className,
    )}
  />
);

/**
 * Small uppercase heading inside a dropdown menu.
 */
export const MenuLabel = ({ className, ...props }: ComponentProps<typeof DropdownMenu.Label>) => (
  <DropdownMenu.Label
    {...props}
    className={cn(
      "px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
      className,
    )}
  />
);

/**
 * Visual keyboard hint at the end of a menu row; pair it with `aria-keyshortcuts` on the row.
 */
export const MenuShortcut = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    aria-hidden
    {...props}
    className={cn(
      "ml-auto flex items-center gap-px pl-2 text-[13px] font-semibold text-muted-foreground [&>svg]:size-3 [&>svg]:stroke-[3]",
      className,
    )}
  />
);

/**
 * Divider between groups of a dropdown menu.
 */
export const MenuSeparator = () => (
  <DropdownMenu.Separator className="-mx-1.5 my-1.5 h-px bg-line" />
);
