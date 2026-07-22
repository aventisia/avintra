import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@avplatform/ui/form";
import type { BaseFieldProps } from "@avplatform/ui/form";
import { useFormContext } from "react-hook-form";
import type { FieldPath, FieldValues } from "react-hook-form";

import { MonacoEditor, type MonacoEditorProps } from "..";

interface MonacoEditorFieldProps extends Omit<MonacoEditorProps, "name">, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A Monaco Editor form field component with label (if provided),
 * integrated with React Hook Form via useFormContext.
 */
const MonacoEditorField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  className,
  disabled,
  ...props
}: MonacoEditorFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
          <FormControl>
            <MonacoEditor
              size={size}
              className={className}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={(value) => field.onChange(value)}
              {...props}
            />
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

MonacoEditorField.displayName = "MonacoEditorField";

export { MonacoEditorField, type MonacoEditorFieldProps };
