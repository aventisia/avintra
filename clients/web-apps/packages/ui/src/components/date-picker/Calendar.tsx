import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import * as React from "react";
import { DayButton, DayPicker, type DayPickerProps, getDefaultClassNames } from "react-day-picker";

import { Button, buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import {
  type YearOption,
  genMonths,
  genYears,
  getValidLocale,
  isLeftNavigationDisabled,
  isRightNavigationDisabled,
} from "./calendar.util";
import type { CalendarHeaderVariant } from "./types";

export type CalendarProps = DayPickerProps & {
  /** Visual variant for navigation buttons. */
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Header style. `"dropdowns"` enables month/year selects. */
  headerVariant?: CalendarHeaderVariant;
  /** Year range around the current year. Default is 50. */
  yearRange?: number;
};

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      classNames,
      showOutsideDays = true,
      captionLayout = "label",
      buttonVariant = "ghost",
      headerVariant = "label",
      yearRange = 50,
      formatters,
      components,
      month,
      locale,
      onMonthChange,
      ...props
    },
    ref,
  ) => {
    const defaultClassNames = getDefaultClassNames();
    const validLocale = getValidLocale(locale);
    const months = React.useMemo(() => genMonths(validLocale), [validLocale]);
    const years: YearOption[] = React.useMemo(() => genYears(yearRange), [yearRange]);

    const showDropdowns = headerVariant === "dropdowns";

    return (
      <div ref={ref} data-slot="calendar">
        <DayPicker
          showOutsideDays={showOutsideDays}
          className={cn(
            "group/calendar bg-background p-3 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
            String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
            String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
            className,
          )}
          captionLayout={showDropdowns ? "dropdown" : captionLayout}
          month={month}
          locale={locale}
          onMonthChange={onMonthChange}
          formatters={{
            formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
            ...formatters,
          }}
          classNames={{
            root: cn("w-fit", defaultClassNames.root),
            months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
            month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
            nav: cn(
              "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
              defaultClassNames.nav,
            ),
            button_previous: cn(
              buttonVariants({ variant: buttonVariant }),
              "size-7 aria-disabled:opacity-50 p-0 select-none",
              showDropdowns && isLeftNavigationDisabled(month, yearRange) && "pointer-events-none",
              defaultClassNames.button_previous,
            ),
            button_next: cn(
              buttonVariants({ variant: buttonVariant }),
              "size-7 aria-disabled:opacity-50 p-0 select-none",
              showDropdowns && isRightNavigationDisabled(month, yearRange) && "pointer-events-none",
              defaultClassNames.button_next,
            ),
            month_caption: cn(
              "flex items-center justify-center h-8 w-full px-8",
              showDropdowns && "relative",
              defaultClassNames.month_caption,
            ),
            dropdowns: cn(
              "w-full flex items-center text-sm font-medium justify-center h-8 gap-2 bg-muted/40 border border-border rounded-md px-2",
              defaultClassNames.dropdowns,
            ),
            dropdown_root: cn("hidden", defaultClassNames.dropdown_root),
            dropdown: cn("hidden", defaultClassNames.dropdown),
            caption_label: cn(
              "select-none font-medium",
              captionLayout === "label"
                ? "text-sm"
                : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
              defaultClassNames.caption_label,
            ),

            weekdays: cn("flex", defaultClassNames.weekdays),
            weekday: cn(
              "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
              defaultClassNames.weekday,
            ),
            week: cn("flex w-full mt-2", defaultClassNames.week),
            week_number_header: cn("select-none w-8", defaultClassNames.week_number_header),
            week_number: cn(
              "text-[0.8rem] select-none text-muted-foreground",
              defaultClassNames.week_number,
            ),
            day: cn(
              "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
              defaultClassNames.day,
            ),
            range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
            range_middle: cn("rounded-none", defaultClassNames.range_middle),
            range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
            today: cn(
              "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
              defaultClassNames.today,
            ),
            outside: cn(
              "text-muted-foreground aria-selected:text-muted-foreground",
              defaultClassNames.outside,
            ),
            disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
            hidden: cn("invisible", defaultClassNames.hidden),
            ...classNames,
          }}
          components={{
            Root: ({ className: rootClassName, rootRef, ...rootProps }) => {
              return (
                <div
                  data-slot="calendar"
                  ref={rootRef}
                  className={cn(rootClassName)}
                  {...rootProps}
                />
              );
            },
            Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
              if (orientation === "left") {
                return (
                  <CaretLeftIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
                );
              }
              if (orientation === "right") {
                return (
                  <CaretRightIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
                );
              }
              return <CaretDownIcon className={cn("size-4", chevronClassName)} {...chevronProps} />;
            },
            DayButton: CalendarDayButton,
            WeekNumber: ({ children, ...weekProps }) => {
              return (
                <td {...weekProps}>
                  <div className="flex size-8 items-center justify-center text-center">
                    {children}
                  </div>
                </td>
              );
            },
            ...(showDropdowns
              ? {
                  MonthCaption: ({ calendarMonth }) => {
                    return (
                      <div className="flex w-full items-stretch justify-center gap-2">
                        <Select
                          value={calendarMonth.date.getMonth().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(calendarMonth.date);
                            newDate.setMonth(Number.parseInt(value, 10));
                            onMonthChange?.(newDate);
                          }}
                        >
                          <SelectTrigger className="w-fit font-medium gap-1" size="xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m) => (
                              <SelectItem key={m.value} value={m.value.toString()}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={calendarMonth.date.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(calendarMonth.date);
                            newDate.setFullYear(Number.parseInt(value, 10));
                            onMonthChange?.(newDate);
                          }}
                        >
                          <SelectTrigger className="w-fit font-medium gap-1" size="xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value.toString()}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  },
                }
              : {}),
            ...components,
          }}
          {...props}
        />
      </div>
    );
  },
);
Calendar.displayName = "Calendar";

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon9"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "group-data-[focused=true]/day:ring-ring/50 flex aspect-square size-auto w-full min-w-8 flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-l-md data-[range-end=true]:bg-primary data-[range-middle=true]:bg-accent data-[range-start=true]:bg-primary data-[selected-single=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:text-accent-foreground data-[range-start=true]:text-primary-foreground data-[selected-single=true]:text-primary-foreground group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
