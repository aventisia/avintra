import { type LucideIcon, Plus, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/ui/lib";

type TableCNFilterTriggerProps = React.ComponentProps<"button"> & {
  title: string;
  isActive: boolean;
  onClear: (event: React.MouseEvent) => void;
  /** Leading icon while the filter is empty. */
  icon?: LucideIcon;
};

/**
 * Dashed chip that opens a toolbar filter. Once the filter has a value it turns solid, shows the
 * value after the title, and its leading icon clears the filter.
 */
export const TableCNFilterTrigger = React.forwardRef<HTMLButtonElement, TableCNFilterTriggerProps>(
  ({ title, isActive, onClear, icon: Icon = Plus, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={isActive || undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-dashed border-line-strong bg-transparent pl-[9px] pr-[11px] text-[12.5px] font-semibold text-ink-2 outline-none transition-colors",
        "hover:border-solid hover:bg-surface hover:text-ink focus-visible:shadow-focus",
        "data-[state=open]:border-line-strong data-[state=open]:bg-hover data-[state=open]:text-ink",
        "data-[active=true]:border-solid data-[active=true]:border-line-strong data-[active=true]:bg-selected data-[active=true]:text-ink",
        className,
      )}
      {...props}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          onClick={onClear}
          className="-ml-0.5 grid size-4 place-items-center rounded-full text-primary-text transition-colors hover:text-primary-hover"
        >
          <XCircle className="size-3.5" />
        </span>
      ) : (
        <Icon aria-hidden="true" className="-ml-0.5 size-3.5 text-muted-foreground" />
      )}
      {title}
      {isActive && children && (
        <>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-line-strong" />
          <span className="flex items-center gap-1">{children}</span>
        </>
      )}
    </button>
  ),
);
TableCNFilterTrigger.displayName = "TableCNFilterTrigger";

/**
 * Value pill inside an active filter trigger.
 */
export const TableCNFilterValue = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    className={cn(
      "max-w-40 truncate rounded-sm bg-surface px-1.5 py-px text-xs font-medium text-primary-text ring-1 ring-line",
      className,
    )}
    {...props}
  />
);
