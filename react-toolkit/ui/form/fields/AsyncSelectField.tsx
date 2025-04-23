import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { ISelectOption } from "@/react-toolkit/types/select-option";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";

import { AsyncSelect, AsyncSelectProps } from "../../async-select";

export type AsyncSelectFieldProps = {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  size: "base" | "xs" | "sm";
} & AsyncSelectProps<ISelectOption> &
  BaseFieldProps;

/**
 * A custom select form field component with label (if provided)
 */
export const AsyncSelectField = ({
  name,
  label,
  disabled,
  size = "base",
  isRequired,
  description,
  ...props
}: AsyncSelectFieldProps) => {
  // Get the form context
  const { control, setValue } = useFormContext<FieldValues>();

  // Render the mponent
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && (
            <FormLabelExt
              {...{ size, label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <AsyncSelect
              {...props}
              label={label}
              value={field.value}
              onChange={(value) => {
                setValue(name, value, {
                  shouldDirty: true,
                });
                field.onChange(value);
              }}
              disabled={field.disabled}
            />
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};
