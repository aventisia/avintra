import { Calendar } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { NotificationTypesEnum } from "@avplatform/ui/enums";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import type { NotificationHistoryParams } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";

/** Read/Unread status filter options */
const READ_STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Read", value: "read" },
  { label: "Unread", value: "unread" },
];

/** Notification type filter options (from the shared enum) */
const TYPE_OPTIONS = Object.values(NotificationTypesEnum);

interface NotificationHistoryFiltersProps {
  /** Current filter params */
  filters: NotificationHistoryParams;

  /** Callback invoked when any filter changes */
  onChange: (filters: NotificationHistoryParams) => void;
}

/**
 * Renders the filter controls for the notification history tab:
 * date range, notification type, and read/unread status.
 */
export const NotificationHistoryFilters = ({
  filters,
  onChange,
}: NotificationHistoryFiltersProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
  });

  const applyDateRange = () => {
    setShowDatePicker(false);
    onChange({
      ...filters,
      from: selectedRange?.from ? selectedRange.from.toISOString() : undefined,
      to: selectedRange?.to ? selectedRange.to.toISOString() : undefined,
    });
  };

  const clearDateRange = () => {
    setSelectedRange({ from: undefined, to: undefined });
    setShowDatePicker(false);
    onChange({ ...filters, from: undefined, to: undefined });
  };

  return (
    <div className="flex flex-col gap-2 border-b px-3 py-2.5">
      <div className="flex items-center gap-2">
        {/* Date range filter */}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button size="xs" variant="outline" className="justify-start">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              {filters.from || filters.to ? (
                <>
                  {filters.from ? format(new Date(filters.from), "MMM d, yyyy") : "Start"} -{" "}
                  {filters.to ? format(new Date(filters.to), "MMM d, yyyy") : "End"}
                </>
              ) : (
                "Date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="mr-4 px-4">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={selectedRange}
              onSelect={setSelectedRange}
            />
            <div className="flex justify-end gap-2 pb-4 pt-4">
              <Button variant="ghost" onClick={clearDateRange}>
                Clear
              </Button>
              <Button onClick={applyDateRange}>Apply</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Notification type filter */}
        <Select
          value={filters.type ?? ""}
          onValueChange={(value) => onChange({ ...filters, type: value || undefined })}
        >
          <SelectTrigger size="xs" className="w-[8.5rem]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Read/Unread status filter */}
        <Select
          value={filters.isRead === undefined ? "" : filters.isRead ? "read" : "unread"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              isRead: value === "" ? undefined : value === "read",
            })
          }
        >
          <SelectTrigger size="xs" className="w-[7rem]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {READ_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
