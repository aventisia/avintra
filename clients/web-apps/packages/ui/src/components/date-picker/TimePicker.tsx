import { toDate } from "date-fns";
import * as React from "react";

import { TimePeriodSelect } from "./TimePeriodSelect";
import { TimePickerInput } from "./TimePickerInput";
import type { Granularity, Period } from "./types";

type TimePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /** Smallest unit displayed. Default is "second". */
  granularity?: Granularity;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
};

export type TimePickerRef = {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
  periodRef: HTMLButtonElement | null;
};

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  (
    {
      value,
      onChange,
      hourCycle = 24,
      granularity = "second",
      showHours = true,
      showMinutes = true,
      showSeconds = true,
    },
    ref,
  ) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = React.useState<Period>(
      value && toDate(value).getHours() >= 12 ? "PM" : "AM",
    );

    /** Keep AM/PM state in sync when the value prop changes externally. */
    React.useEffect(() => {
      if (value) {
        setPeriod(toDate(value).getHours() >= 12 ? "PM" : "AM");
      }
    }, [value]);

    React.useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
        periodRef: periodRef.current,
      }),
      [minuteRef, hourRef, secondRef, periodRef],
    );

    return (
      <div className="flex items-center justify-center gap-2">
        {showHours && (
          <>
            <TimePickerInput
              label="hr"
              picker={hourCycle === 24 ? "hours" : "12hours"}
              date={value}
              id="datetime-picker-hour-input"
              onDateChange={onChange}
              ref={hourRef}
              period={period}
              onRightFocus={() => minuteRef?.current?.focus()}
            />
            <span className="text-muted-foreground">:</span>
          </>
        )}
        {showMinutes && (granularity === "minute" || granularity === "second") && (
          <>
            <TimePickerInput
              label="min"
              picker="minutes"
              date={value}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
            {showSeconds && granularity === "second" && (
              <span className="text-muted-foreground">:</span>
            )}
          </>
        )}
        {showSeconds && granularity === "second" && (
          <TimePickerInput
            label="sec"
            picker="seconds"
            date={value}
            onDateChange={onChange}
            ref={secondRef}
            onLeftFocus={() => minuteRef?.current?.focus()}
            onRightFocus={() => periodRef?.current?.focus()}
          />
        )}
        {hourCycle === 12 && (
          <div className="grid gap-1 text-center">
            <TimePeriodSelect
              period={period}
              setPeriod={setPeriod}
              date={value}
              onDateChange={(date) => {
                onChange?.(date);
                if (date && toDate(date).getHours() >= 12) {
                  setPeriod("PM");
                } else {
                  setPeriod("AM");
                }
              }}
              ref={periodRef}
              onLeftFocus={() => secondRef?.current?.focus()}
            />
          </div>
        )}
      </div>
    );
  },
);
TimePicker.displayName = "TimePicker";

export { TimePicker };
