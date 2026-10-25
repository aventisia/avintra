import { type Column, type Table } from "@tanstack/react-table";
import { Check, Settings2 } from "lucide-react";

import { Button } from "@/ui/components/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import { cn } from "@/ui/lib";

import {
  TABLE_CN_COMMAND_INPUT_CLASS_NAME,
  TABLE_CN_COMMAND_ITEM_CLASS_NAME,
  TABLE_CN_PANEL_CLASS_NAME,
  TABLE_CN_TOOLBAR_BUTTON_CLASS_NAME,
} from "./constants/table-cn-class-names.constant";

const getColumnLabel = <TData,>(column: Column<TData, unknown>) =>
  column.columnDef.meta?.label ?? column.id;

const isListedColumn = <TData,>(column: Column<TData, unknown>) =>
  column.getCanHide() &&
  (column.accessorFn !== undefined || column.columnDef.meta?.label !== undefined);

type TableCNViewOptionsProps<TData> = {
  table: Table<TData>;
  className?: string;
};

/**
 * Searchable list of hideable columns to show or hide. Lists accessor columns and display
 * columns that have a `meta.label`.
 */
export const TableCNViewOptions = <TData,>({
  table,
  className,
}: TableCNViewOptionsProps<TData>) => {
  const columns = table.getAllLeafColumns().filter(isListedColumn);
  const hiddenCount = columns.filter((column) => !column.getIsVisible()).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="View columns"
          variant="outline"
          size="xs"
          className={cn("hidden lg:flex", TABLE_CN_TOOLBAR_BUTTON_CLASS_NAME, className)}
        >
          <Settings2 />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "w-56 overflow-hidden")}
      >
        <Command>
          <div className="border-b border-slate-100">
            <CommandInput
              placeholder="Search columns..."
              className={TABLE_CN_COMMAND_INPUT_CLASS_NAME}
            />
          </div>
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-slate-500">
              No columns found.
            </CommandEmpty>
            <CommandGroup
              heading={hiddenCount > 0 ? `${hiddenCount} hidden` : "Columns"}
              className="p-1.5"
            >
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  value={getColumnLabel(column)}
                  onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                  className={TABLE_CN_COMMAND_ITEM_CLASS_NAME}
                >
                  <span className="truncate">{getColumnLabel(column)}</span>
                  <Check
                    className={cn(
                      "ml-auto size-3.5 shrink-0 text-indigo-600",
                      column.getIsVisible() ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
