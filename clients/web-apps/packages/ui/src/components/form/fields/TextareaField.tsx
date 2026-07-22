import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Textarea } from "@/ui/components";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { cn } from "@/ui/lib";

interface TextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof Textarea>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A custom textarea form field component with label (if provided)
 */
const TextareaField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  className,
  disabled,
  ...props
}: TextareaFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the TextareaField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
          <FormControl>
            <Textarea
              size={size}
              className={cn(className)}
              disabled={disabled}
              {...field}
              ref={field.ref}
              {...props}
            />
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

TextareaField.displayName = "TextareaField";

export { TextareaField, type TextareaFieldProps };
