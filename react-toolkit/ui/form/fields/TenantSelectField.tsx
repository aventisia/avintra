import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { useFetchTenantsToSelect } from "@/react-toolkit/hooks/useFetchTenantsToSelect";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/react-toolkit/ui/select";

interface TenantSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom select form field component with label (if provided)
 */
const TenantSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: TenantSelectFieldProps) => {
  // Get the form context

  const { control, setValue } = useFormContext<FieldValues>();

  const { selectOptions } = useFetchTenantsToSelect(!!isRequired);
  // Render the TenantSelectField component
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
              onValueChange={(value) => {
                field.onChange(value);
                setValue(name, value);
              }}
              defaultValue={field.value}
            >
              <SelectTrigger size={size} {...field} {...props} ref={field.ref}>
                <SelectValue
                  placeholder={placeholder ?? `Select ${label}`}
                ></SelectValue>
              </SelectTrigger>

              <SelectContent>
                {selectOptions?.map((item) => (
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

TenantSelectField.displayName = "TenantSelectField";

export { TenantSelectField, type TenantSelectFieldProps };
