import * as React from "react";

import { FloatingLabelInput } from "@/ui/components/floating-label-input";
import { cn } from "@/ui/lib";

import { getArrowByType, getDateByType, setDateByType } from "./time-picker.util";
import type { Period, TimePickerType } from "./types";

type TimePickerInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
  label?: string;
};

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  (
    {
      className,
      type = "tel",
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      label,
      ...props
    },
    ref,
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

    /** Allow the second digit to be entered within 2 seconds, then reset. */
    React.useEffect(() => {
      if (!flag) return undefined;
      const timer = setTimeout(() => setFlag(false), 2000);
      return () => clearTimeout(timer);
    }, [flag]);

    const calculatedValue = React.useMemo(() => getDateByType(date, picker), [date, picker]);

    const calculateNewValue = (key: string) => {
      // 12-hour edge case: if first digit is 0 and second is 1, keep the value as 01-09.
      if (
        picker === "12hours" &&
        flag &&
        calculatedValue.slice(1, 2) === "1" &&
        prevIntKey === "0"
      ) {
        return `0${key}`;
      }
      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= "0" && e.key <= "9") {
        if (picker === "12hours") setPrevIntKey(e.key);
        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <FloatingLabelInput
        label={label}
        ref={ref}
        id={id ?? picker}
        name={name ?? picker}
        className={cn(
          "w-10 text-center p-0 text-sm tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        value={value || calculatedValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          onChange?.(e);
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        {...props}
      />
    );
  },
);
TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };
export type { TimePickerInputProps };
