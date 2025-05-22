import { ISelectOption } from "@aventisia/ui/types";
import { BaseFieldProps } from "@aventisia/ui/form";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface SelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the select field. */
  selectOptions: ISelectOption[];

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom select form field component with label (if provided)
 */
const SelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  placeholder,
  ...props
}: SelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the SelectField component
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
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger size={size} {...field} {...props} ref={field.ref}>
                <SelectValue
                  placeholder={placeholder ? "Select" : placeholder}
                />
              </SelectTrigger>

              <SelectContent>
                {selectOptions.map((item) => (
                  <SelectItem size={size} key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

SelectField.displayName = "SelectField";

export { SelectField, type SelectFieldProps };
