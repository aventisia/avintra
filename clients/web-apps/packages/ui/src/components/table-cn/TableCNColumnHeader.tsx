import { type Column, type SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, EyeOff, type LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { cn } from "@/ui/lib";

import { TABLE_CN_PANEL_CLASS_NAME } from "./constants/table-cn-class-names.constant";

const SortIcon = ({ direction }: { direction: false | SortDirection }) => {
  if (direction === "asc") return <ArrowUp className="size-3.5 text-indigo-600" />;
  if (direction === "desc") return <ArrowDown className="size-3.5 text-indigo-600" />;
  return (
    <ChevronsUpDown className="size-3.5 text-slate-300 transition-colors group-hover/header:text-slate-500" />
  );
};

type HeaderMenuItemProps = {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onSelect: () => void;
};

const HeaderMenuItem = ({ icon: Icon, label, isActive = false, onSelect }: HeaderMenuItemProps) => (
  <DropdownMenuItem
    onSelect={onSelect}
    className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-700 focus:bg-muted focus:text-slate-900"
  >
    <Icon className="size-4 text-slate-500" />
    {label}
    {isActive && <Check className="ml-auto size-4 text-indigo-600" />}
  </DropdownMenuItem>
);

type TableCNColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  label: string;
  className?: string;
};

/**
 * Column header with a menu to sort ascending or descending (choosing the active one clears it)
 * and to hide the column.
 */
export const TableCNColumnHeader = <TData, TValue>({
  column,
  label,
  className,
}: TableCNColumnHeaderProps<TData, TValue>) => {
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  if (!canSort && !canHide) return <div className={className}>{label}</div>;

  const sortDirection = column.getIsSorted();

  const onSortDirectionChange = (direction: SortDirection) => {
    if (sortDirection === direction) column.clearSorting();
    else column.toggleSorting(direction === "desc");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group/header -ml-2 inline-flex h-7 items-center gap-1 rounded-lg px-2 outline-none transition-colors",
          "hover:bg-slate-200/60 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/50 data-[state=open]:bg-slate-200/60 data-[state=open]:text-slate-900",
          sortDirection && "text-slate-900",
          className,
        )}
      >
        {label}
        {canSort && <SortIcon direction={sortDirection} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "w-48 max-w-none p-1.5")}
      >
        {canSort && (
          <>
            <HeaderMenuItem
              icon={ArrowUp}
              label="Sort ascending"
              isActive={sortDirection === "asc"}
              onSelect={() => onSortDirectionChange("asc")}
            />
            <HeaderMenuItem
              icon={ArrowDown}
              label="Sort descending"
              isActive={sortDirection === "desc"}
              onSelect={() => onSortDirectionChange("desc")}
            />
          </>
        )}
        {canSort && canHide && <DropdownMenuSeparator className="-mx-1.5 my-1.5 bg-slate-100" />}
        {canHide && (
          <HeaderMenuItem
            icon={EyeOff}
            label="Hide column"
            onSelect={() => column.toggleVisibility(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
