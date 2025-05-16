import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { format, getHours, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Calendar, CalendarProps } from "./Calendar";

// Constants
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const AMPM_OPTIONS = ["AM", "PM"] as const;

export type AmPm = (typeof AMPM_OPTIONS)[number];

export type DateTimePickerProps = {
  value?: Date | null;
  onValueChange?: (date: Date | undefined) => void;
  disabled?: boolean;
} & CalendarProps;

export function DateTimePicker({
  value,
  onValueChange,
  disabled = false,
}: Readonly<DateTimePickerProps>) {
  const [localDate, setLocalDate] = React.useState<Date | undefined>(
    value ?? undefined,
  );
  const [open, setOpen] = React.useState(false);

  // Sync localDate with external value
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setLocalDate(new Date(value));
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (disabled) return;

    const newDate = selectedDate ? new Date(selectedDate) : undefined;

    if (newDate && localDate) {
      newDate.setHours(localDate.getHours());
      newDate.setMinutes(localDate.getMinutes());
    }

    setLocalDate(newDate);
    onValueChange?.(newDate);
  };

  const updateTime = (type: "hour" | "minute" | "ampm", valueStr: string) => {
    if (disabled || !localDate) return;

    let updatedDate = new Date(localDate);

    switch (type) {
      case "hour":
        {
          const hour = parseInt(valueStr);
          const isPm = getHours(updatedDate) >= 12;
          updatedDate = setHours(updatedDate, (hour % 12) + (isPm ? 12 : 0));
        }
        break;
      case "minute":
        updatedDate = setMinutes(updatedDate, parseInt(valueStr));
        break;
      case "ampm":
        {
          const currentHour = getHours(updatedDate);
          updatedDate = setHours(
            updatedDate,
            valueStr === "PM" ? currentHour + 12 : currentHour - 12,
          );
        }
        break;
    }

    setLocalDate(updatedDate);
    onValueChange?.(updatedDate);
  };

  const formattedDate = localDate
    ? format(localDate, "MM/dd/yyyy hh:mm aa")
    : "MM/dd/yyyy hh:mm aa";

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !localDate && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-60",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-auto p-0">
          <div className="flex flex-col sm:flex-row">
            <ScrollArea className="max-h-[300px] sm:max-h-none">
              <Calendar
                mode="single"
                selected={localDate}
                hideNavigation={false}
                onSelect={handleSelect}
                captionLayout="dropdown"
                startMonth={new Date()}
                endMonth={new Date(2099, 10, 10)}
              />
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <div className="flex flex-row divide-y sm:h-[20rem] sm:divide-x sm:divide-y-0">
              <TimeSection title="Hour">
                {HOURS.map((hour) => (
                  <TimeButton
                    key={hour}
                    label={hour.toString()}
                    isSelected={
                      !!(localDate && getHours(localDate) % 12 === hour % 12)
                    }
                    onClick={() => updateTime("hour", hour.toString())}
                  />
                ))}
              </TimeSection>

              <TimeSection title="Minute">
                {MINUTES.map((minute) => (
                  <TimeButton
                    key={minute}
                    label={minute.toString().padStart(2, "0")}
                    isSelected={localDate?.getMinutes() === minute}
                    onClick={() => updateTime("minute", minute.toString())}
                  />
                ))}
              </TimeSection>

              <TimeSection title="AM/PM">
                {AMPM_OPTIONS.map((ampm) => (
                  <TimeButton
                    key={ampm}
                    label={ampm}
                    isSelected={
                      !!(
                        localDate &&
                        ((ampm === "AM" && getHours(localDate) < 12) ||
                          (ampm === "PM" && getHours(localDate) >= 12))
                      )
                    }
                    onClick={() => updateTime("ampm", ampm)}
                  />
                ))}
              </TimeSection>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}

interface TimeSectionProps {
  title: string;
  children: React.ReactNode;
}

export function TimeSection({ title, children }: Readonly<TimeSectionProps>) {
  return (
    <ScrollArea className="max-h-[300px] w-64 sm:w-auto">
      <div className="p-2">
        <h4 className="mb-2 px-2 text-sm font-medium">{title}</h4>
        <div className="flex gap-1 sm:flex-col">{children}</div>
      </div>
      <ScrollBar orientation="horizontal" className="sm:hidden" />
    </ScrollArea>
  );
}

interface TimeButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TimeButton({
  label,
  isSelected,
  onClick,
}: Readonly<TimeButtonProps>) {
  return (
    <Button
      size="icon5"
      variant={isSelected ? "default" : "ghost"}
      className="aspect-square shrink-0 sm:w-full"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
