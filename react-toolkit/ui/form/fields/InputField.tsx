import { cn } from "@aventisia/ui/lib";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { BaseFieldProps } from "@aventisia/ui/form";
import { Input } from "@aventisia/ui";
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
              {...field}
              {...props}
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
