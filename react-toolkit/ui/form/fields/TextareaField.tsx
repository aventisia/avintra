import { cn } from "@aventisia/ui/lib";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { Textarea } from "@/react-toolkit/ui/textarea";
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
