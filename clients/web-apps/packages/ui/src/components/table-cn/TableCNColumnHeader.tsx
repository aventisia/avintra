import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretUpDownIcon,
  CheckIcon,
  EyeSlashIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { type Column, type SortDirection } from "@tanstack/react-table";

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
  if (direction === "asc") return <ArrowUpIcon className="size-3" />;
  if (direction === "desc") return <ArrowDownIcon className="size-3" />;
  return (
    <CaretUpDownIcon className="size-3 text-muted-foreground/50 transition-colors group-hover/header:text-muted-foreground" />
  );
};

type HeaderMenuItemProps = {
  icon: PhosphorIcon;
  label: string;
  isActive?: boolean;
  onSelect: () => void;
};

const HeaderMenuItem = ({ icon: Icon, label, isActive = false, onSelect }: HeaderMenuItemProps) => (
  <DropdownMenuItem onSelect={onSelect} className="text-ink-2 focus:text-ink">
    <Icon className="size-4 text-muted-foreground" />
    {label}
    {isActive && <CheckIcon className="ml-auto size-4 text-primary-text" />}
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
          "group/header -ml-2 inline-flex h-6 items-center gap-1 rounded-sm px-2 uppercase outline-none transition-colors duration-[120ms] ease-out",
          "hover:bg-hover hover:text-ink-2 focus-visible:shadow-focus data-[state=open]:bg-hover data-[state=open]:text-ink-2",
          sortDirection && "text-ink-2",
          className,
        )}
      >
        {label}
        {canSort && <SortIcon direction={sortDirection} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "w-48 max-w-none p-1")}
      >
        {canSort && (
          <>
            <HeaderMenuItem
              icon={ArrowUpIcon}
              label="Sort ascending"
              isActive={sortDirection === "asc"}
              onSelect={() => onSortDirectionChange("asc")}
            />
            <HeaderMenuItem
              icon={ArrowDownIcon}
              label="Sort descending"
              isActive={sortDirection === "desc"}
              onSelect={() => onSortDirectionChange("desc")}
            />
          </>
        )}
        {canSort && canHide && <DropdownMenuSeparator className="bg-line" />}
        {canHide && (
          <HeaderMenuItem
            icon={EyeSlashIcon}
            label="Hide column"
            onSelect={() => column.toggleVisibility(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
