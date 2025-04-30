import { cn } from "@/react-toolkit/lib/utils";
import { AutosizeTextarea } from "@/react-toolkit/ui/autosize-textarea/AutosizeTextarea";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";

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
