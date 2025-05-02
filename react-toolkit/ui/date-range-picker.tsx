import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@aventisia/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { Button } from "@aventisia/ui/buttons";
import { Calendar } from "@aventisia/ui";

interface DateRangePickerProps {
  selectedDate: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}
export function DatePickerWithRange({
  selectedDate,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size={"xs"}
            className={cn(
              "flex w-[240px] items-center justify-start gap-2 text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>
              {" "}
              {selectedDate?.from ? (
                selectedDate.to ? (
                  <>
                    {format(selectedDate.from, "LLL dd, y")} -{" "}
                    {format(selectedDate.to, "LLL dd, y")}
                  </>
                ) : (
                  format(selectedDate.from, "LLL dd, y")
                )
              ) : (
                "Pick a date"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
