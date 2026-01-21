import { Calendar } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import {
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  paramsToRange,
  rangeToParams,
} from "../constants/date-range-selector-utils";
import { DateRange } from "../stores/date-range-store";
import { useDateRangePickerStore } from "../stores/date-range-store";

export const DateRangeFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dateRange, setDateRange } = useDateRangePickerStore();

  const [showRangePicker, setShowRangePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const hydratedRef = useRef(false);
  const today = new Date();

  const isCurrentTab = searchParams.get("t") == "Current";

  /* -------------------------------
     Default last 7 days
  -------------------------------- */

  const defaultRange: DateRange = {
    from: subDays(today, 6),
    to: today,
  };

  // Sync date range selection with URL param on mount
  useEffect(() => {
    if (hydratedRef.current) return;

    const urlRange = paramsToRange(
      searchParams.get("from"),
      searchParams.get("to"),
    );

    const finalRange = urlRange ?? defaultRange;

    // Set store + local picker state
    setDateRange(finalRange);
    setSelectedRange(finalRange);

    // If URL missing, push default to URL
    if (!urlRange) {
      const params = Object.fromEntries(searchParams.entries());
      Object.assign(params, rangeToParams(finalRange));
      setSearchParams(params);
    }

    hydratedRef.current = true;
  }, [searchParams, setSearchParams, setDateRange]);

  const applyRange = useCallback(
    (range?: DateRange) => {
      if (!range) return;

      setDateRange(range);

      const params = Object.fromEntries(searchParams.entries());
      Object.assign(params, rangeToParams(range));
      setSearchParams(params);
    },
    [searchParams, setSearchParams, setDateRange],
  );

  //  Presets
  const presets = [
    { label: "Today", value: "today" },
    { label: "Week to Date", value: "week" },
    { label: "Month to Date", value: "month" },
    { label: "Last 7 days", value: 7 },
    { label: "Last 15 days", value: 15 },
    { label: "Last 30 days", value: 30 },
  ];

  const getPresetRange = (preset: (typeof presets)[number]) => {
    let from: Date;

    if (typeof preset.value === "string") {
      if (preset.value === "today") from = today;
      else if (preset.value === "week")
        from = startOfWeek(today, { weekStartsOn: 0 });
      else from = startOfMonth(today);
    } else {
      from = subDays(today, preset.value - 1);
    }

    return { from, to: today };
  };

  const isSameRange = (r1?: DateRange, r2?: DateRange) =>
    r1 && r2 && isSameDay(r1.from!, r2.from!) && isSameDay(r1.to!, r2.to!);

  if (!selectedRange) return null;

  return (
    <Popover open={showRangePicker} onOpenChange={setShowRangePicker}>
      <PopoverTrigger disabled={isCurrentTab}>
        <Button disabled={isCurrentTab} size="xs" variant="outline">
          <CalendarDays className="mr-2 h-3.5 w-3.5" />
          {format(selectedRange.from!, "MMM d, yyyy")} -{" "}
          {format(selectedRange.to!, "MMM d, yyyy")}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="mr-4 px-4">
        <div className="grid grid-cols-[auto_1fr] gap-6">
          {/* Presets */}
          <div className="flex flex-col gap-2 border-r pr-4 pt-4">
            {presets.map((preset) => {
              const range = getPresetRange(preset);
              const isSelected = isSameRange(selectedRange, range);

              return (
                <Button
                  key={preset.label}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedRange(range)}
                  className={`justify-start border-none shadow-none ${
                    isSelected
                      ? "hover:bg-primary/90 bg-primary-50 text-primary"
                      : ""
                  }`}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>

          <div>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={selectedRange}
              onSelect={setSelectedRange}
            />

            <div className="flex justify-end gap-2 pb-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRangePicker(false);
                  setSelectedRange(dateRange);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRangePicker(false);
                  applyRange(selectedRange);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
