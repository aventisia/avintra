import { cn } from "@/react-toolkit/lib/utils";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { Input } from "@/react-toolkit/ui/input";

import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface InputFieldProps
  extends React.ComponentPropsWithoutRef<typeof Input>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A custom input form field component with label (if provided)
 */
const InputField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  className,
  disabled,
  type,
  nonErrorMessage,
  ...props
}: InputFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          {label && (
            <FormLabelExt
              size={fieldSize}
              {...{ label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <Input
              fieldSize={fieldSize}
              type={type}
              className={cn(className)}
              disabled={disabled}
              {...props}
              {...field}
              ref={field.ref}
            />
          </FormControl>

          {nonErrorMessage ? (
            <FormMessage
              customMessageType={nonErrorMessage.type}
              size={fieldSize}
            >
              {nonErrorMessage.message}
            </FormMessage>
          ) : (
            <FormMessage size={fieldSize} />
          )}
        </FormItem>
      )}
    />
  );
};

InputField.displayName = "InputField";

export { InputField, type InputFieldProps };
