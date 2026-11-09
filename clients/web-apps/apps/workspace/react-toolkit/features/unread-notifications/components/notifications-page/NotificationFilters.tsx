import { Calendar } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { NotificationTypesEnum } from "@avplatform/ui/enums";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import {
  TABLE_CN_COMMAND_INPUT_CLASS_NAME,
  TABLE_CN_COMMAND_ITEM_CLASS_NAME,
  TABLE_CN_PANEL_CLASS_NAME,
  TableCNFilterTrigger,
  TableCNFilterValue,
  TableCNOptionMark,
} from "@avplatform/ui/table-cn";
import { CalendarIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";

import type { NotificationHistoryParams } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { NOTIFICATION_SOURCE_LABELS } from "@/react-toolkit/features/unread-notifications/constants/constants";

export type NotificationFilterValues = Omit<NotificationHistoryParams, "isRead">;

const FilterSelect = ({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TableCNFilterTrigger
          title={title}
          isActive={!!selected}
          onClear={(event) => {
            event.stopPropagation();
            onChange(undefined);
          }}
        >
          {selected && <TableCNFilterValue>{selected.label}</TableCNFilterValue>}
        </TableCNFilterTrigger>
      </PopoverTrigger>
      <PopoverContent
        aria-label={`${title} filter`}
        align="start"
        sideOffset={6}
        className={`${TABLE_CN_PANEL_CLASS_NAME} w-60 overflow-hidden`}
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
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden p-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(isSelected ? undefined : option.value);
                      setIsOpen(false);
                    }}
                    className={TABLE_CN_COMMAND_ITEM_CLASS_NAME}
                  >
                    <TableCNOptionMark isSelected={isSelected} multiple={false} />
                    <span className="flex-1 truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const TYPE_OPTIONS = Object.values(NotificationTypesEnum).map((type) => ({
  value: type,
  label: type,
}));

const SOURCE_OPTIONS = Object.entries(NOTIFICATION_SOURCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const formatDay = (iso?: string) => (iso ? format(new Date(iso), "MMM d") : "…");

const DateRangeFilter = ({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
}) => {
  const isActive = !!(from || to);
  const clear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TableCNFilterTrigger title="Date" isActive={isActive} onClear={clear} icon={CalendarIcon}>
          <TableCNFilterValue>{`${formatDay(from)} – ${formatDay(to)}`}</TableCNFilterValue>
        </TableCNFilterTrigger>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Date filter"
        align="start"
        sideOffset={6}
        className={`${TABLE_CN_PANEL_CLASS_NAME} w-auto overflow-hidden`}
      >
        <Calendar
          mode="range"
          autoFocus
          selected={{ from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined }}
          onSelect={(range) =>
            onChange({ from: range?.from?.toISOString(), to: range?.to?.toISOString() })
          }
        />
        {isActive && (
          <div className="border-t border-line p-2">
            <Button
              aria-label="Clear date filter"
              variant="ghost"
              size="xs"
              className="w-full text-sm"
              onClick={clear}
            >
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export const NotificationFilters = ({
  filters,
  onChange,
}: {
  filters: NotificationFilterValues;
  onChange: (filters: NotificationFilterValues) => void;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <FilterSelect
      title="Type"
      value={filters.type}
      options={TYPE_OPTIONS}
      onChange={(type) => onChange({ ...filters, type })}
    />
    <FilterSelect
      title="Source"
      value={filters.sourceType}
      options={SOURCE_OPTIONS}
      onChange={(sourceType) => onChange({ ...filters, sourceType })}
    />
    <DateRangeFilter
      from={filters.from}
      to={filters.to}
      onChange={(range) => onChange({ ...filters, ...range })}
    />
  </div>
);
