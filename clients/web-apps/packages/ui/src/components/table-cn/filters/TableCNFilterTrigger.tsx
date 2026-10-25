import { type LucideIcon, PlusCircle, XCircle } from "lucide-react";
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
  ({ title, isActive, onClear, icon: Icon = PlusCircle, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={isActive || undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-slate-300 bg-background px-2.5 text-sm font-medium text-slate-600 outline-none transition-colors",
        "hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        "data-[state=open]:border-slate-400 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900",
        "data-[active=true]:border-solid data-[active=true]:border-indigo-200 data-[active=true]:bg-indigo-50/60 data-[active=true]:text-slate-900",
        className,
      )}
      {...props}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          onClick={onClear}
          className="-ml-0.5 grid size-4 place-items-center rounded-full text-indigo-500 transition-colors hover:text-indigo-700"
        >
          <XCircle className="size-3.5" />
        </span>
      ) : (
        <Icon aria-hidden="true" className="-ml-0.5 size-3.5 text-slate-400" />
      )}
      {title}
      {isActive && children && (
        <>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-indigo-200" />
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
      "max-w-40 truncate rounded-md bg-background px-1.5 py-px text-xs font-medium text-indigo-700 ring-1 ring-indigo-100",
      className,
    )}
    {...props}
  />
);
