import {
  type BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { DateTimePicker, type DateTimePickerProps } from "../../date-picker";

export type DateTimePickerFieldProps = DateTimePickerProps &
  BaseFieldProps & {
    /** The name of the form field. */
    name: FieldPath<FieldValues>;
    /** Size of the field trigger. */
    fieldSize?: FormFieldSizeType;
    /** Disable the field. */
    disabled?: boolean;
  };

/**
 * A single form field for date-only or date-time selection.
 * Use `granularity="day"` for date-only inputs.
 */
export const DateTimePickerField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
  className,
  ...props
}: DateTimePickerFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          {label && (
            <FormLabelExt size={fieldSize} label={label} disabled={disabled} isRequired={isRequired} description={description} />
          )}
          <FormControl>
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              className={cn(
                fieldSize === "xs" && "h-7 pl-[0.45rem] pr-1 text-2xs",
                fieldSize === "sm" && "h-8 pl-[0.55rem] pr-1.5 text-xs",
                fieldSize === "base" && "h-10 pl-3 pr-2.5 text-sm",
                className,
              )}
              {...props}
            />
          </FormControl>
          {nonErrorMessage ? (
            <FormMessage customMessageType={nonErrorMessage.type} size={fieldSize}>
              {nonErrorMessage.message}
            </FormMessage>
          ) : (
            <FormMessage size={fieldSize} />
          )}
        </FormItem>
      )}
    />
  );
};

DateTimePickerField.displayName = "DateTimePickerField";
