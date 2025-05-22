import { cn } from "@aventisia/ui/lib";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { BaseFieldProps } from "@aventisia/ui/form";
import { Textarea } from "@aventisia/ui";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface TextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof Textarea>,
    BaseFieldProps {
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
          {label && (
            <FormLabelExt
              {...{ size, label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <Textarea
              size={size}
              className={cn(className)}
              disabled={disabled}
              {...props}
              {...field}
              ref={field.ref}
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
