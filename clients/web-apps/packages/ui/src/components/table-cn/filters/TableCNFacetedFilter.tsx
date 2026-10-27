import { type Column } from "@tanstack/react-table";
import { Check } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import { cn } from "@/ui/lib";

import {
  TABLE_CN_COMMAND_INPUT_CLASS_NAME,
  TABLE_CN_COMMAND_ITEM_CLASS_NAME,
  TABLE_CN_PANEL_CLASS_NAME,
} from "../constants/table-cn-class-names.constant";
import { type TableCNFilterOption } from "../types/table-cn.type";
import { toSelectedValues } from "../utils/table-cn-filter-value.util";
import { TableCNFilterTrigger, TableCNFilterValue } from "./TableCNFilterTrigger";

const MAX_LISTED_SELECTIONS = 2;

const OptionMark = ({ isSelected, multiple }: { isSelected: boolean; multiple: boolean }) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid size-4 shrink-0 place-items-center border transition-colors",
      multiple ? "rounded-sm" : "rounded-full",
      isSelected
        ? "border-indicator bg-indicator text-primary-foreground"
        : "border-line-strong bg-surface text-transparent",
    )}
  >
    <Check className="size-3 stroke-[3]" />
  </span>
);

type TableCNFacetedFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title?: string;
  options: TableCNFilterOption[];
  multiple?: boolean;
  /** Shows how many loaded rows match each option when the option has no `count`. */
  showFacetCounts?: boolean;
};

/**
 * Select or multi-select filter listing the column's options with search and match counts.
 */
export const TableCNFacetedFilter = <TData, TValue>({
  column,
  title = column.columnDef.meta?.label ?? column.id,
  options,
  multiple = false,
  showFacetCounts = true,
}: TableCNFacetedFilterProps<TData, TValue>) => {
  const [open, setOpen] = React.useState(false);

  const selectedValues = toSelectedValues(column.getFilterValue());
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const facets = showFacetCounts ? column.getFacetedUniqueValues() : undefined;

  const onReset = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    column.setFilterValue(undefined);
  };

  const onSelectOption = (value: string) => {
    const isSelected = selectedValues.includes(value);
    const otherValues = selectedValues.filter((selectedValue) => selectedValue !== value);
    const nextValues = multiple
      ? isSelected
        ? otherValues
        : [...selectedValues, value]
      : isSelected
        ? []
        : [value];

    column.setFilterValue(nextValues.length > 0 ? nextValues : undefined);
    if (!multiple) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TableCNFilterTrigger title={title} isActive={selectedValues.length > 0} onClear={onReset}>
          {selectedValues.length > MAX_LISTED_SELECTIONS ? (
            <TableCNFilterValue>{selectedValues.length} selected</TableCNFilterValue>
          ) : (
            selectedOptions.map((option) => (
              <TableCNFilterValue key={option.value}>{option.label}</TableCNFilterValue>
            ))
          )}
        </TableCNFilterTrigger>
      </PopoverTrigger>
      <PopoverContent
        aria-label={`${title} filter`}
        align="start"
        sideOffset={6}
        className={cn(TABLE_CN_PANEL_CLASS_NAME, "w-60 overflow-hidden")}
      >
        <Command>
          <div className="border-b border-line">
            <CommandInput
              placeholder={`Filter by ${title.toLowerCase()}...`}
              className={TABLE_CN_COMMAND_INPUT_CLASS_NAME}
            />
          </div>
          <CommandList className="max-h-full">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden p-1.5">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const count = option.count ?? facets?.get(option.value) ?? 0;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => onSelectOption(option.value)}
                    className={TABLE_CN_COMMAND_ITEM_CLASS_NAME}
                  >
                    <OptionMark isSelected={isSelected} multiple={multiple} />
                    {option.icon && (
                      <option.icon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {showFacetCounts && (
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator className="mx-0 bg-line" />
                <CommandGroup className="p-1.5">
                  <CommandItem
                    onSelect={() => onReset()}
                    className={cn(TABLE_CN_COMMAND_ITEM_CLASS_NAME, "justify-center")}
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
