import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";

import { display12HourValue, setDateByType } from "./time-picker.util";
import type { Period } from "./types";

type PeriodSelectorProps = {
  period: Period;
  setPeriod?: (period: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
};

const TimePeriodSelect = React.forwardRef<HTMLButtonElement, PeriodSelectorProps>(
  ({ period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      /** Trigger an update when toggling AM/PM so the user doesn't have to re-type the hour. */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(setDateByType(tempDate, hours, "12hours", value));
      }
    };

    return (
      <div className="flex h-10 items-center">
        <Select value={period} onValueChange={(value: Period) => handleValueChange(value)}>
          <SelectTrigger
            ref={ref}
            className="w-10 justify-center px-0 text-sm tabular-nums [&>svg]:hidden focus:bg-accent focus:text-accent-foreground"
            onKeyDown={handleKeyDown}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
);
TimePeriodSelect.displayName = "TimePeriodSelect";

export { TimePeriodSelect };
