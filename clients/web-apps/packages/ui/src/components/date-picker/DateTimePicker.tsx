import { CalendarIcon } from "@phosphor-icons/react";
import { format, toDate } from "date-fns";
import { enUS } from "date-fns/locale";
import * as React from "react";
import type { Locale } from "react-day-picker";

import { Button } from "@/ui/components/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import { cn } from "@/ui/lib";

import { Calendar } from "./Calendar";
import { TimePicker } from "./TimePicker";
import { DEFAULT_YEAR_RANGE } from "./calendar.util";
import type { Granularity } from "./types";

/** Copies the time component from `source` onto `target`. */
function copyTime(target: Date, source: Date): Date {
  target.setHours(source.getHours(), source.getMinutes(), source.getSeconds());
  return target;
}

export type DateTimePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onMonthChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  /** Show AM/PM select. */
  hourCycle?: 12 | 24;
  placeholder?: string;
  /** Year range around today. Default is 50. */
  yearRange?: number;
  /** date-fns display format overrides. */
  displayFormat?: { hour24?: string; hour12?: string };
  /** Smallest unit shown. "day" hides the time picker. */
  granularity?: Granularity;
  className?: string;
  /** Initial popup month/value. Defaults to today at midnight. */
  defaultPopupValue?: Date;
} & Pick<
  React.ComponentProps<typeof Calendar>,
  "weekStartsOn" | "showWeekNumber" | "showOutsideDays"
> & {
    /** Locale used by the calendar and date-fns formatting. */
    locale?: Locale;
  };

export type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLButtonElement, "value">;

const defaultDateFormat = (granularity: Granularity | undefined) => {
  if (granularity === "day") {
    return { hour24: "PPP", hour12: "PP" };
  }
  const seconds = granularity === "second" ? ":ss" : "";
  return {
    hour24: `PPP HH:mm${seconds}`,
    hour12: `PP hh:mm${seconds} b`,
  };
};

const DateTimePicker = React.forwardRef<Partial<DateTimePickerRef>, DateTimePickerProps>(
  (
    {
      locale = enUS,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      onMonthChange,
      hourCycle = 24,
      yearRange = DEFAULT_YEAR_RANGE,
      disabled = false,
      displayFormat,
      granularity = "second",
      placeholder = "Pick a date",
      className,
      ...calendarProps
    },
    ref,
  ) => {
    const [month, setMonth] = React.useState<Date>(value ?? defaultPopupValue);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [displayDate, setDisplayDate] = React.useState<Date | undefined>(value ?? undefined);

    React.useEffect(() => {
      setDisplayDate(value);
      if (value) setMonth(value);
    }, [value]);

    const handleMonthChange = React.useCallback(
      (newDay: Date | undefined) => {
        if (!newDay) return;
        const next = copyTime(new Date(newDay), toDate(month));
        onMonthChange?.(next);
        setMonth(next);
      },
      [month, onMonthChange],
    );

    const handleSelect = React.useCallback(
      (newDay?: Date) => {
        if (!newDay) return;
        onChange?.(newDay);
        setMonth(newDay);
        setDisplayDate(newDay);
      },
      [onChange],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value: displayDate,
      }),
      [displayDate],
    );

    const formatStrings = {
      hour24: displayFormat?.hour24 ?? defaultDateFormat(granularity).hour24,
      hour12: displayFormat?.hour12 ?? defaultDateFormat(granularity).hour12,
    };

    return (
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start pl-[11px] text-left text-body font-normal data-[state=open]:border-focus data-[state=open]:ring-[3px] data-[state=open]:ring-focus/[0.28]",
              !displayDate && "text-muted-foreground",
              className,
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {displayDate ? (
              format(displayDate, hourCycle === 24 ? formatStrings.hour24 : formatStrings.hour12, {
                locale,
              })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={displayDate}
            month={month}
            onSelect={(newDate) => {
              if (newDate) {
                handleSelect(copyTime(new Date(newDate), toDate(month)));
              }
            }}
            onMonthChange={handleMonthChange}
            yearRange={yearRange}
            headerVariant="dropdowns"
            locale={locale}
            {...calendarProps}
          />
          {granularity !== "day" && (
            <div className="border-t border-border p-3">
              <TimePicker
                onChange={(nextValue) => {
                  onChange?.(nextValue);
                  setDisplayDate(nextValue);
                  if (nextValue) {
                    setMonth(nextValue);
                  }
                }}
                value={month}
                hourCycle={hourCycle}
                granularity={granularity}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);
DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
