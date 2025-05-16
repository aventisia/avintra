"use client";

import { Label } from "@aventisia/ui/label";
import { cn } from "@aventisia/ui/lib";
import * as React from "react";

import { TimePickerInput } from "./time-picker-input";

export interface TimePickerProps {
  value?: Date;
  setValue?: (date: Date | undefined) => void;

  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

export function TimePicker({
  value,
  setValue,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
}: Readonly<TimePickerProps>) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-end gap-2">
      {showHours && (
        <div className="grid gap-1 text-center">
          <Label htmlFor="hours" className="-ms-1 text-xs">
            Hours
          </Label>
          <TimePickerInput
            picker="hours"
            date={value}
            setDate={(d) => setValue?.(d)}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
        </div>
      )}

      {showMinutes && (
        <div className="grid gap-1 text-center">
          <Label
            htmlFor="minutes"
            className={cn(!showHours && "-me-1", "text-xs")}
          >
            Minutes
          </Label>
          <TimePickerInput
            picker="minutes"
            date={value}
            setDate={(d) => setValue?.(d)}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => secondRef.current?.focus()}
          />
        </div>
      )}

      {showSeconds && (
        <div className="grid gap-1 text-center">
          <Label htmlFor="seconds" className="text-xs">
            Seconds
          </Label>
          <TimePickerInput
            picker="seconds"
            date={value}
            setDate={(d) => setValue?.(d)}
            ref={secondRef}
            onLeftFocus={() => minuteRef.current?.focus()}
          />
        </div>
      )}
    </div>
  );
}
