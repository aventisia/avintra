import { Calendar } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { format, isSameDay, startOfMonth, startOfWeek, subDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface HistoryDateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * Date-range filter for the History tab. Matches the visual style used in the
 * Tenant Admin Usage tab: a popover with a two-month range calendar plus quick
 * preset ranges (Today, Week/Month to Date, Last N days).
 */
const HistoryDateRangeFilter = ({ value, onChange }: HistoryDateRangeFilterProps) => {
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);

  useEffect(() => {
    if (showRangePicker) {
      setSelectedRange(value);
    }
  }, [showRangePicker, value]);

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

  const getPresetRange = (preset: (typeof presets)[number]): DateRange => {
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

  const isSameRange = (r1: DateRange | undefined, r2: DateRange | undefined) => {
    return r1 && r2 && isSameDay(r1.from!, r2.from!) && isSameDay(r1.to!, r2.to!);
  };

  return (
    <Popover open={showRangePicker} onOpenChange={setShowRangePicker}>
      <PopoverTrigger>
        <Button variant={"outline"} className="flex items-center" size="sm">
          <CalendarDays className="mr-2 h-4 w-4" />
          {format(value?.from || "", "MMM d, yyyy")} - {format(value?.to || "", "MMM d, yyyy")}
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
                    isSelected ? "bg-selected text-primary-text hover:bg-selected" : ""
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
              onSelect={(range) => {
                if (range) setSelectedRange(range);
              }}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2 pb-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRangePicker(false);
                  setSelectedRange(value); // revert selection
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRangePicker(false);
                  onChange(selectedRange);
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

export default HistoryDateRangeFilter;
