import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/ui/components";
import { useIsInsideCrudDialog } from "@/ui/components/crud-dialog/CrudDialogContext";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { cn } from "@/ui/lib";

import { crudDialogFieldClasses } from "../crud-dialog-field-classes";

interface InputFieldProps extends React.ComponentPropsWithoutRef<typeof Input>, BaseFieldProps {
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
  const isInDialog = useIsInsideCrudDialog() && fieldSize === "base";

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize} className={cn(isInDialog && crudDialogFieldClasses.item)}>
          {label && (
            <FormLabelExt size={fieldSize} {...{ label, disabled, isRequired, description }} />
          )}
          <FormControl>
            <Input
              fieldSize={fieldSize}
              type={type}
              className={cn(isInDialog && crudDialogFieldClasses.input, className)}
              disabled={disabled}
              {...field}
              ref={field.ref}
              {...props}
            />
          </FormControl>

          {nonErrorMessage ? (
            <FormMessage customMessageType={nonErrorMessage.type} size={fieldSize}>
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
