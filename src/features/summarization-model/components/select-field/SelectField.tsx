import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

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
              <SelectTrigger size={size} {...field} ref={field.ref} {...props}>
                <SelectValue
                  placeholder={placeholder ? "Select" : placeholder}
                />
              </SelectTrigger>

              <SelectContent>
                {selectOptions.map((item) => (
                  <>
                    <SelectItem
                      size={size}
                      key={item.value}
                      value={item.value}
                      description={item.description}
                    >
                      {item.label}
                    </SelectItem>
                  </>
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
