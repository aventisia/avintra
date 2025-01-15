import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface CheckboxFieldProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The label of the form field. */
  label: React.ReactNode;
}

/**
 * A custom simple checkbox form field component to show single line checkbox without description.
 */
const CheckboxField = ({
  name,
  label,
  disabled,
  ...props
}: CheckboxFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the CheckboxField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          <div className="ml-0.5 flex items-center gap-2">
            <FormControl>
              <Checkbox
                disabled={disabled}
                checked={field.value}
                onCheckedChange={field.onChange}
                {...props}
                {...field}
                ref={field.ref}
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
