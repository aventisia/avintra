import type * as React from "react";

import { cn } from "@/ui/lib";

/**
 * Card that frames the table and its footer.
 */
export const TableCNFrame = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "overflow-hidden rounded-xl bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-border",
      className,
    )}
    {...props}
  />
);

/**
 * Table with separated borders, so sticky pinned cells keep their borders while scrolling.
 */
export const TableCNTableElement = ({ className, ...props }: React.ComponentProps<"table">) => (
  <table
    className={cn("w-full border-separate border-spacing-0 text-sm text-slate-700", className)}
    {...props}
  />
);

export const TableCNRowElement = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr
    className={cn(
      "group/row bg-background transition-colors hover:bg-slate-50",
      "data-[state=selected]:bg-[#f5f6ff] data-[state=selected]:hover:bg-[#eef0fe]",
      className,
    )}
    {...props}
  />
);

export const TableCNHeadElement = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "h-10 whitespace-nowrap border-b border-border bg-slate-50 px-3 text-left align-middle text-[13px] font-semibold text-slate-600 first:pl-4 last:pr-4",
      className,
    )}
    {...props}
  />
);

export const TableCNCellElement = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td
    className={cn(
      "h-12 whitespace-nowrap border-b border-slate-100 px-3 align-middle first:pl-4 last:pr-4 group-last/row:border-b-0",
      "first:group-data-[state=selected]/row:shadow-[inset_2px_0_0_#6366f1]",
      className,
    )}
    {...props}
  />
);
