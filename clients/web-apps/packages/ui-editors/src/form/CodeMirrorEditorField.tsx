import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@avplatform/ui/form";
import type { BaseFieldProps } from "@avplatform/ui/form";
import type { FormFieldSizeType } from "@avplatform/ui/types";
import { useFormContext } from "react-hook-form";
import type { FieldPath, FieldValues } from "react-hook-form";

import { CodeEditor, type CodeEditorProps } from "..";

interface CodeEditorFieldProps extends Omit<CodeEditorProps, "value" | "onChange">, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  /** Controls label and message sizing. */
  size?: FormFieldSizeType;
}

const CodeEditorField = ({
  name,
  label,
  description,
  className,
  disabled,
  isRequired,
  size = "base",
  ...props
}: CodeEditorFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={size}>
          <FormLabelExt
            size={size}
            label={label}
            isRequired={isRequired && !disabled}
            description={description}
          />
          <FormControl>
            <CodeEditor
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              className={className}
              {...props}
            />
          </FormControl>
          <FormMessage size={size} />
        </FormItem>
      )}
    />
  );
};

CodeEditorField.displayName = "CodeEditorField";

export { CodeEditorField, type CodeEditorFieldProps };
