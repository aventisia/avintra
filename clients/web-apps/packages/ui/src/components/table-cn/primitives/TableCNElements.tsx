import type * as React from "react";

import { cn } from "@/ui/lib";

/**
 * Card that frames the table and its footer.
 */
export const TableCNFrame = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("overflow-hidden rounded-lg border border-line bg-surface", className)}
    {...props}
  />
);

/**
 * Table with separated borders, so sticky pinned cells keep their borders while scrolling.
 */
export const TableCNTableElement = ({ className, ...props }: React.ComponentProps<"table">) => (
  <table
    className={cn(
      "w-full border-separate border-spacing-0 text-body-sm tabular-nums text-ink-2",
      className,
    )}
    {...props}
  />
);

export const TableCNRowElement = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr
    className={cn(
      "group/row bg-surface transition-colors duration-[120ms] ease-out hover:bg-hover",
      "data-[state=selected]:bg-[color-mix(in_srgb,var(--primary)_6%,var(--surface))]",
      className,
    )}
    {...props}
  />
);

export const TableCNHeadElement = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "h-11 whitespace-nowrap border-b border-line bg-sunken px-3 text-left align-middle font-mono text-label uppercase text-muted-foreground first:pl-4 last:pr-4 aria-[sort]:text-ink-2",
      className,
    )}
    {...props}
  />
);

export const TableCNCellElement = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td
    className={cn(
      "h-row whitespace-nowrap border-b border-line px-3 align-middle first:pl-4 last:pr-4 group-last/row:border-b-0",
      "first:group-data-[state=selected]/row:shadow-[inset_2px_0_0_var(--indicator)]",
      className,
    )}
    {...props}
  />
);
