import { Calendar } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { NotificationTypesEnum } from "@avplatform/ui/enums";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { format } from "date-fns";
import { CalendarDaysIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import type { NotificationHistoryParams } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { NOTIFICATION_SOURCE_LABELS } from "@/react-toolkit/features/unread-notifications/constants/constants";

export type NotificationFilterValues = Omit<NotificationHistoryParams, "isRead">;

const ANY = "any";

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value?: string) => void;
}) => (
  <Select value={value ?? ANY} onValueChange={(next) => onChange(next === ANY ? undefined : next)}>
    <SelectTrigger aria-label={label} className="h-9 w-auto min-w-[8.5rem] gap-2">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={ANY}>Any {label.toLowerCase()}</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

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
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();

  const apply = (next?: DateRange) => {
    setIsOpen(false);
    onChange({ from: next?.from?.toISOString(), to: next?.to?.toISOString() });
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open)
          setRange({ from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined });
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 gap-1.5 font-normal">
          <CalendarDaysIcon className="size-3.5 text-muted-foreground" />
          {from || to ? `${formatDay(from)} – ${formatDay(to)}` : "Any date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-3">
        <Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" size="sm" onClick={() => apply(undefined)}>
            Clear
          </Button>
          <Button size="sm" onClick={() => apply(range)}>
            Apply
          </Button>
        </div>
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
      label="Type"
      value={filters.type}
      options={TYPE_OPTIONS}
      onChange={(type) => onChange({ ...filters, type })}
    />
    <FilterSelect
      label="Source"
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
