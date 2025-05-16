import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { TimePicker } from "../../date-time-picker/TimePicker";

export type TimePickerFieldProps = BaseFieldProps & {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  fieldSize?: "base" | "sm" | "xs";
  disabled?: boolean;
};

/**
 * A custom input form field component with label (if provided)
 */
export const TimePickerField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
}: TimePickerFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          {label && (
            <FormLabelExt
              size={fieldSize}
              {...{ label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <TimePicker value={field.value} setValue={field.onChange} />
          </FormControl>

          {nonErrorMessage ? (
            <FormMessage
              customMessageType={nonErrorMessage.type}
              size={fieldSize}
            >
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
