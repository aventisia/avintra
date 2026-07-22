import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Checkbox } from "@/ui/components/Checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@/ui/components/form";

interface CheckboxFieldProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The label of the form field. */
  label: React.ReactNode;
}

/**
 * A custom simple checkbox form field component to show single line checkbox without description.
 */
const CheckboxField = ({ name, label, disabled, ...props }: CheckboxFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the CheckboxField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          <div className="ml-0.5 flex items-start gap-2">
            <FormControl>
              <Checkbox
                disabled={disabled}
                checked={field.value}
                onCheckedChange={field.onChange}
                {...field}
                ref={field.ref}
                {...props}
              />
            </FormControl>

            {/* show checkbox label infront of checkbox */}
            {label}
          </div>

          {/* show form error message */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

CheckboxField.displayName = "CheckboxField";

export { CheckboxField, type CheckboxFieldProps };
