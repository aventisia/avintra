import { DateTimePicker } from "@avplatform/ui/date-picker";

/**
 * A date-only picker that binds to an ISO/empty string value.
 * Use where a date field is entered by a human.
 */
export const DateInput = ({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const parsed = value ? new Date(value) : undefined;

  return (
    <DateTimePicker
      granularity="day"
      value={parsed}
      onChange={(date) => onChange(date ? date.toISOString() : "")}
      disabled={disabled}
      placeholder={placeholder ?? "Pick a date"}
      hourCycle={24}
    />
  );
};
