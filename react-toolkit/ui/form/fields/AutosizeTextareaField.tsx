import { cn } from "@aventisia/ui/lib";
import { AutosizeTextarea } from "@aventisia/ui";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { BaseFieldProps } from "@aventisia/ui/form";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface AutosizeTextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof AutosizeTextarea>,
    BaseFieldProps {
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
          {label && (
            <FormLabelExt {...{ label, disabled, isRequired, description }} />
          )}
          <FormControl>
            <AutosizeTextarea
              minHeight={minHeight}
              maxHeight={maxHeight}
              className={cn(className)}
              disabled={disabled}
              {...props}
              {...field}
              ref={field.ref}
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
