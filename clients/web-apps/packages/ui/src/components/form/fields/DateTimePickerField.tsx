import {
  type BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { DateTimePicker, type DateTimePickerProps } from "../../date-time-picker";

export type DateTimePickerFieldProps = DateTimePickerProps &
  BaseFieldProps & {
    /** The name of the form field. */
    name: FieldPath<FieldValues>;
    fieldSize?: "base" | "sm" | "xs";
    disabled?: boolean;
  };

/**
 * A custom input form field component with label (if provided)
 */
export const DateTimePickerField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
  ...props
}: DateTimePickerFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          {label && (
            <FormLabelExt size={fieldSize} {...{ label, disabled, isRequired, description }} />
          )}
          <FormControl>
            <DateTimePicker value={field.value} onChange={field.onChange} {...props} />
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
