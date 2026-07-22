import * as React from "react";

import { cn } from "@/ui/lib";

const TableExt = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("min-w-full caption-bottom text-sm", className)} {...props} />
  ),
);
TableExt.displayName = "TableExt";

const TableExtHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
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
    className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
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
      "group border-b transition-colors hover:bg-muted data-[state=selected]:bg-muted",
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
      "h-12 pl-6 pr-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
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
    className={cn("py-2 pl-6 pr-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableExtCell.displayName = "TableExtCell";

const TableExtCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
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
