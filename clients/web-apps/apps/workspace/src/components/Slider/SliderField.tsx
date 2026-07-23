import { FormControl, FormLabelExt } from "@avplatform/ui/form";
import { FormField } from "@avplatform/ui/form";
import { FormItem } from "@avplatform/ui/form";
import { FormMessage } from "@avplatform/ui/form";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Slider } from "./Slider";

// Omit the native Radix values so they don't clash with React Hook Form
interface SliderFieldProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange"
> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Optional label displayed alongside the slider. */
  label?: string;

  description?: string;
  isRequired?: boolean;
  thumbColor?: string;
  trackColor?: string;
}

/**
 * A form-integrated slider field component using Radix UI.
 */
const SliderField = ({
  name,
  label,
  thumbColor,
  trackColor = "bg-muted",
  disabled,
  min,
  max,
  description,
  isRequired,
  ...props
}: SliderFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div>
            {label && (
              <FormLabelExt label={label} description={description} isRequired={isRequired} />
            )}
            <div className="mt-1 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-lg border p-2.5">
              <span className="text-xs">{min}</span>

              <FormControl>
                <Slider
                  disabled={disabled}
                  // Convert RHF's number into Radix's number array
                  value={[field.value ?? min ?? 0]}
                  // Extract the first number from Radix's array for RHF
                  onValueChange={(val) => field.onChange(val[0])}
                  onValueCommit={field.onBlur}
                  thumbColor={thumbColor}
                  trackColor={trackColor}
                  min={min}
                  max={max}
                  {...props}
                />
              </FormControl>
              <span className="text-xs">{max}</span>
            </div>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

SliderField.displayName = "SliderField";

export { SliderField, type SliderFieldProps };
