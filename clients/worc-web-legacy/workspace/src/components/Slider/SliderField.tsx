import { FormControl, FormLabelExt } from "@aventisia/ui/form";
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
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          <div>
            {label && (
              <FormLabelExt
                label={`${label}`}
                description={description}
                isRequired={isRequired}
              />
            )}
            <div className="mt-1 flex  items-center gap-2 rounded-lg border p-2.5 bg-background h-9">
              <span className="text-sm">{min}</span>

              <FormControl>
                <Slider
                  disabled={disabled}
                  value={field.value ?? [0]}
                  onValueChange={field.onChange}
                  onValueCommit={field.onBlur}
                  thumbColor={thumbColor}
                  trackColor={trackColor}
                  min={min}
                  max={max}
                  {...props}
                />
              </FormControl>
              <span className="text-sm">{max}</span>
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
