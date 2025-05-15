import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Slider } from "./Slider";

interface SliderFieldProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Optional label displayed alongside the slider. */
  label?: React.ReactNode;
}

/**
 * A form-integrated slider field component using Radix UI.
 */
const SliderField = ({ name, label, disabled, ...props }: SliderFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          {label && <div className="mb-2 text-sm font-medium">{label}</div>}

          <FormControl>
            <Slider
              disabled={disabled}
              value={field.value ?? [0]}
              onValueChange={field.onChange}
              onValueCommit={field.onBlur}
              {...props}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

SliderField.displayName = "SliderField";

export { SliderField, type SliderFieldProps };
