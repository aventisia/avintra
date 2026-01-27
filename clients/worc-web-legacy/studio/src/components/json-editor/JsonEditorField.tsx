import { FormControl, FormLabelExt } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { JsonEditor } from "./JsonEditor";
import { cn } from "@aventisia/ui/lib";

interface JsonEditorFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Optional label displayed alongside the JsonViewer. */
  label?: string;

  description?: string;

  className?: string;

  disabled?: boolean;
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
}: JsonEditorFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <>
      <FormField
        name={name}
        control={control}
        render={({ field }) => (
          <FormItem size={"sm"}>
            <FormLabelExt size={"sm"} label={label} description={description} />
            <FormControl>
              <JsonEditor
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                className={cn(className)}
              />
            </FormControl>

            <FormMessage size={"sm"} />
          </FormItem>
        )}
      />
    </>
  );
};

JsonEditorField.displayName = "JsonEditorField";

export { JsonEditorField, type JsonEditorFieldProps };
