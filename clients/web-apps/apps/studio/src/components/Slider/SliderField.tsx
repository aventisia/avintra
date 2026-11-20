import { FormControl, FormLabelExt } from "@avplatform/ui/form";
import { FormField } from "@avplatform/ui/form";
import { FormItem } from "@avplatform/ui/form";
import { FormMessage } from "@avplatform/ui/form";
import { FIELD_CONTAINER, FIELD_CONTAINER_DISABLED, cn } from "@avplatform/ui/lib";
import { type FormFieldSizeType } from "@avplatform/ui/types";
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
  /** Shows the current value beside the slider, formatted by this function, in place of the hover bubble. */
  formatValue?: (value: number) => string;
  /** "sm" matches the height of small selects so the slider can share a row with them. */
  size?: FormFieldSizeType;
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
  formatValue,
  size = "base",
  ...props
}: SliderFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = Number(field.value ?? min ?? 0);
        return (
          <FormItem size={size}>
            <div>
              {label && (
                <FormLabelExt
                  size={size}
                  label={label}
                  description={description}
                  isRequired={isRequired}
                />
              )}
              <div
                className={cn(
                  FIELD_CONTAINER,
                  "grid items-center gap-2",
                  formatValue ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[auto_1fr_auto]",
                  size === "base" ? "mt-1 p-2.5" : "mt-1 h-8 px-2.5",
                  disabled && FIELD_CONTAINER_DISABLED,
                )}
              >
                <span
                  className={cn(size === "base" ? "text-xs" : "text-2xs text-muted-foreground")}
                >
                  {min}
                </span>

                <FormControl>
                  <Slider
                    disabled={disabled}
                    // Convert RHF's number into Radix's number array
                    value={[currentValue]}
                    // Extract the first number from Radix's array for RHF
                    onValueChange={(val) => field.onChange(val[0])}
                    onValueCommit={field.onBlur}
                    thumbColor={thumbColor}
                    trackColor={trackColor}
                    showValueBubble={!formatValue}
                    thumbAriaLabel={label}
                    valueText={formatValue ? formatValue(currentValue) : undefined}
                    min={min}
                    max={max}
                    {...props}
                  />
                </FormControl>
                <span
                  className={cn(size === "base" ? "text-xs" : "text-2xs text-muted-foreground")}
                >
                  {max}
                </span>
                {formatValue && (
                  <output className="min-w-10 border-l border-line pl-2 text-right font-mono text-hint tabular-nums text-ink">
                    {formatValue(currentValue)}
                  </output>
                )}
              </div>
            </div>

            <FormMessage size={size} />
          </FormItem>
        );
      }}
    />
  );
};

SliderField.displayName = "SliderField";

export { SliderField, type SliderFieldProps };
