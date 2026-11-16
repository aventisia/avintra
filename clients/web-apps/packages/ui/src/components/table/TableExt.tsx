import * as React from "react";

import { cn } from "@/ui/lib";

const TableExt = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("min-w-full caption-bottom text-body-sm tabular-nums text-ink-2", className)}
      {...props}
    />
  ),
);
TableExt.displayName = "TableExt";

const TableExtHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-sunken [&_tr]:border-b [&_tr]:border-line", className)}
    {...props}
  />
));
TableExtHeader.displayName = "TableExtHeader";

const TableExtBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableExtBody.displayName = "TableExtBody";

const TableExtFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t border-line bg-sunken font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableExtFooter.displayName = "TableExtFooter";

// NOTE: Group is added to the table row to allow for hover states on the row actions cell when the row is hovered.
const TableExtRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group border-b border-line transition-colors duration-[120ms] ease-out hover:bg-hover data-[state=selected]:bg-selected data-[state=selected]:[&>td:first-child]:shadow-[inset_2px_0_0_var(--indicator)]",
      className,
    )}
    {...props}
  />
));
TableExtRow.displayName = "TableExtRow";

const TableExtHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-8 whitespace-nowrap px-3 text-left align-middle font-mono text-label uppercase text-muted-foreground first:pl-4 aria-[sort]:text-ink-2 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableExtHead.displayName = "TableExtHead";

const TableExtCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "h-row px-3 py-1 align-middle first:pl-4 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableExtCell.displayName = "TableExtCell";

const TableExtCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-body-sm text-muted-foreground", className)}
    {...props}
  />
));
TableExtCaption.displayName = "TableExtCaption";

export {
  TableExt,
  TableExtHeader,
  TableExtBody,
  TableExtFooter,
  TableExtHead,
  TableExtRow,
  TableExtCell,
  TableExtCaption,
};
