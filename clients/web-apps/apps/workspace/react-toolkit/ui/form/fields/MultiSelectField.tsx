import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { MultiSelect, MultiSelectProps } from "../MultiSelect";

export type MultiSelectFieldProps = MultiSelectProps &
  BaseFieldProps & {
    /** The name of the form field. */
    name: FieldPath<FieldValues>;
    fieldSize?: "base" | "sm" | "xs";
    disabled?: boolean;
  };

/**
 * A custom input form field component with label (if provided)
 */
export const MultiSelectField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
  ...props
}: MultiSelectFieldProps) => {
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
            <MultiSelect
              onValueChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
              disabled={field.disabled}
              name={field.name}
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
