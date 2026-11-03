import { useIsInsideCrudDialog } from "@avplatform/ui/crud-dialog";
import { FormControl, FormLabelExt, crudDialogFieldClasses } from "@avplatform/ui/form";
import { FormField } from "@avplatform/ui/form";
import { FormItem } from "@avplatform/ui/form";
import { FormMessage } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { JsonEditor } from "./JsonEditor";

interface JsonEditorFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Optional label displayed alongside the JsonViewer. */
  label?: string;

  description?: string;

  className?: string;

  disabled?: boolean;

  isRequired?: boolean;

  size?: FormFieldSizeType;
}

/**
 * A form-integrated JsonViewer field component using Radix UI.
 */
const JsonEditorField = ({
  name,
  label,
  description,
  className,
  disabled,
  isRequired,
  size = "base",
}: JsonEditorFieldProps) => {
  const { control } = useFormContext<FieldValues>();
  const isInDialog = useIsInsideCrudDialog() && size === "base";

  return (
    <>
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
              <JsonEditor
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                className={cn(isInDialog && crudDialogFieldClasses.jsonEditor, className)}
              />
            </FormControl>

            <FormMessage size={size} />
          </FormItem>
        )}
      />
    </>
  );
};

JsonEditorField.displayName = "JsonEditorField";

export { JsonEditorField, type JsonEditorFieldProps };
