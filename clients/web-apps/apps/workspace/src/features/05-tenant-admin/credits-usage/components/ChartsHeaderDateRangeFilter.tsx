import { Calendar } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { format, isSameDay, startOfMonth, startOfWeek, subDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

import { useDateRangePickerStore } from "../store/date-range-store";

const ChartsHeaderDateRangeFilter = () => {
  const [showRangePicker, setShowRangePicker] = useState(false);
  const { setDateRange, dateRange } = useDateRangePickerStore();
  const [selectedRange, setSelectedRange] = useState(dateRange);

  useEffect(() => {
    if (showRangePicker && dateRange) {
      setSelectedRange(dateRange);
    }
  }, [showRangePicker, dateRange]);

  const today = new Date();

  const presets = [
    { label: "Today", value: "today" },
    { label: "Week to Date", value: "week" },
    { label: "Month to Date", value: "month" },
    { label: "Last 7 days", value: 7 },
    { label: "Last 15 days", value: 15 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
    { label: "Last 365 days", value: 365 },
  ];

  const getPresetRange = (preset: (typeof presets)[number]) => {
    let from: Date;

    if (typeof preset.value === "string") {
      if (preset.value === "today") {
        from = today;
      } else if (preset.value === "week") {
        from = startOfWeek(today, { weekStartsOn: 0 });
      } else {
        from = startOfMonth(today);
      }
    } else {
      from = subDays(today, preset.value - 1); // include today
    }

    return { from, to: today };
  };

  const isSameRange = (r1: typeof dateRange, r2: typeof dateRange) => {
    return r1 && r2 && isSameDay(r1.from!, r2.from!) && isSameDay(r1.to!, r2.to!);
  };
  return (
    <Popover open={showRangePicker} onOpenChange={setShowRangePicker}>
      <PopoverTrigger>
        <Button variant={"outline"} className="flex items-center">
          <CalendarDays className="mr-3 h-4 w-4" /> {format(dateRange?.from || "", "MMM d, yyyy")} -{" "}
          {format(dateRange?.to || "", "MMM d, yyyy")}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="mr-4 px-4">
        <div className="grid grid-cols-[auto_1fr] gap-6">
          {/* PRESETS */}
          <div className="flex flex-col gap-2 border-r pr-4 pt-4">
            {presets.map((preset) => {
              const presetRange = getPresetRange(preset);
              const isSelected = isSameRange(selectedRange, presetRange);

              return (
                <Button
                  key={preset.label}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`justify-start border-none shadow-none ${
                    isSelected ? "hover:bg-primary/90 bg-primary-50 text-primary" : ""
                  }`}
                  onClick={() => setSelectedRange(presetRange)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>

          <div>
            <Calendar
              mode="range"
              selected={selectedRange}
              numberOfMonths={2}
              onSelect={(range) => setSelectedRange(range)}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2 pb-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRangePicker(false);
                  setSelectedRange(dateRange); // revert selection
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRangePicker(false);
                  setDateRange(selectedRange);
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

export default ChartsHeaderDateRangeFilter;
