import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { Button, type ButtonProps } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

type TableCNActionBarProps<TData> = React.ComponentProps<"div"> & {
  table: Table<TData>;
};

/**
 * Floating toolbar shown at the bottom of the screen while rows are selected.
 * Escape clears the selection unless an open dialog or menu handles it first.
 */
export const TableCNActionBar = <TData,>({
  table,
  className,
  style,
  children,
  ...props
}: TableCNActionBarProps<TData>) => {
  const isOpen = table.getFilteredSelectedRowModel().rows.length > 0;

  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) table.toggleAllRowsSelected(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, table]);

  if (!isOpen || typeof document === "undefined") return null;

  // IMPORTANT NOTE: The bar is centred with the CSS `translate` property; the enter animation
  // overrides `transform`, so a translate utility class would make it jump sideways.
  return createPortal(
    <div
      role="toolbar"
      aria-label="Selected rows actions"
      aria-orientation="horizontal"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex items-center gap-1.5 rounded-xl bg-background p-1.5 text-sm shadow-[0_18px_44px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.08]",
        "duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 motion-reduce:animate-none",
        className,
      )}
      style={{ translate: "-50% 0", ...style }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
};

/**
 * Selected row count with a button that clears the selection.
 */
export const TableCNActionBarSelection = <TData,>({ table }: { table: Table<TData> }) => (
  <div className="flex h-8 items-center gap-1.5 rounded-lg border border-border pl-2.5 pr-1">
    <span className="font-semibold tabular-nums text-slate-900">
      {table.getFilteredSelectedRowModel().rows.length}
    </span>
    <span className="text-slate-500">selected</span>
    <span aria-hidden="true" className="ml-0.5 h-4 w-px bg-border" />
    <Tooltip content="Clear selection" shortcut="Esc" side="top">
      <button
        type="button"
        aria-label="Clear selection"
        onClick={() => table.toggleAllRowsSelected(false)}
        className="grid size-6 place-items-center rounded-md text-slate-400 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      >
        <X className="size-3.5" />
      </button>
    </Tooltip>
  </div>
);

export const TableCNActionBarSeparator = () => (
  <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />
);

type TableCNActionBarItemProps = Omit<ButtonProps, "variant" | "size"> & {
  icon: React.ComponentType<IconProps>;
  tone?: "default" | "destructive";
};

/**
 * Labelled action of the action bar; it forwards its ref so it can trigger a menu.
 */
export const TableCNActionBarItem = React.forwardRef<HTMLButtonElement, TableCNActionBarItemProps>(
  ({ icon: Icon, tone = "default", className, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="xs"
      className={cn(
        "h-8 gap-1.5 px-2.5 text-sm font-medium",
        tone === "destructive"
          ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          : "text-slate-700 data-[state=open]:bg-muted data-[state=open]:text-slate-900",
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5 shrink-0" />
      {children}
    </Button>
  ),
);
TableCNActionBarItem.displayName = "TableCNActionBarItem";
