import * as React from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { useFetchLicensesToSelect } from '@/react-toolkit/hooks/useFetchLicense';
import { BaseFieldProps } from '@/react-toolkit/ui/form/fields/base-field-props';
import { FormControl } from '@/react-toolkit/ui/form/FormControl';
import { FormField } from '@/react-toolkit/ui/form/FormField';
import { FormItem } from '@/react-toolkit/ui/form/FormItem';
import { FormMessage } from '@/react-toolkit/ui/form/FormMessage';
import { FormLabelExt } from '@/react-toolkit/ui/form/non-field/FormLabelExt';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/react-toolkit/ui/select';

interface LicenseSelectFieldProps
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
const LicenseSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: LicenseSelectFieldProps) => {
  // Get the form context

  const { control, setValue } = useFormContext<FieldValues>();

  const { data } = useFetchLicensesToSelect();

  // Render the LicenseSelectField component
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
              <SelectTrigger
                className={
                  field.value
                    ? ""
                    : "capitalize [&>span]:text-sm [&>span]:text-muted-foreground"
                }
                size={size}
                {...field}
                {...props}
                ref={field.ref}
              >
                <SelectValue placeholder={placeholder ?? `Select ${label}`} />
              </SelectTrigger>

              <SelectContent>
                {data?.data?.map((item) => (
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

LicenseSelectField.displayName = "LicenseSelectField";

export { LicenseSelectField, type LicenseSelectFieldProps };
