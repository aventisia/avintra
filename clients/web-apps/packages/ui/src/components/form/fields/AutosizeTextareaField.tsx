import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { AutosizeTextarea } from "@/ui/components/AutosizeTextarea";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { cn } from "@/ui/lib";

interface AutosizeTextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof AutosizeTextarea>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A custom autosize textarea form field component with label (if provided)
 */
const AutosizeTextareaField = ({
  name,
  minHeight,
  maxHeight = 200,
  label,
  isRequired,
  description,
  className,
  disabled,
  ...props
}: AutosizeTextareaFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the AutosizeTextareaField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabelExt {...{ label, disabled, isRequired, description }} />}
          <FormControl>
            <AutosizeTextarea
              minHeight={minHeight}
              maxHeight={maxHeight}
              className={cn(className)}
              disabled={disabled}
              {...field}
              ref={field.ref}
              {...props}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

AutosizeTextareaField.displayName = "AutosizeTextareaField";

export { AutosizeTextareaField, type AutosizeTextareaFieldProps };
