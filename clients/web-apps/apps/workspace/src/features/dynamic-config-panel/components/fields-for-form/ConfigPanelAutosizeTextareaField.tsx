import { useIsInsideCrudDialog } from "@avplatform/ui/crud-dialog";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  crudDialogFieldClasses,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import * as React from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { ConfigPanelAutosizeTextarea } from "../..";

interface ConfigPanelAutosizeTextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof ConfigPanelAutosizeTextarea>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A custom autosize textarea form field component with label (if provided)
 */
const ConfigPanelAutosizeTextareaField = ({
  name,
  minHeight,
  maxHeight = 200,
  label,
  isRequired,
  description,
  className,
  disabled,
  ...props
}: ConfigPanelAutosizeTextareaFieldProps) => {
  const caretRef = React.useRef<number>(0);
  const isInDialog = useIsInsideCrudDialog();

  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const { field: textareaField } = useController({
    name,
    control,
  });

  // Set caret position on blur
  const handleCaretChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    caretRef.current = e.currentTarget.selectionStart ?? 0;
  };

  // Render the AutosizeTextareaField component
  return (
    <div className="group relative">
      <FormField
        {...{ name, textareaField }}
        render={({ field }) => (
          <FormItem className={cn(isInDialog && crudDialogFieldClasses.item)}>
            {label && <FormLabelExt {...{ label, disabled, isRequired, description }} />}

            <FormControl>
              <ConfigPanelAutosizeTextarea
                size="sm"
                // IMPORTANT NOTE: The autosize hook adds 2px to both the min and measured height, so 40 settles a single line at the 44px dialog input height.
                minHeight={isInDialog ? 40 : minHeight}
                maxHeight={maxHeight}
                className={cn(
                  "h-8",
                  isInDialog && cn(crudDialogFieldClasses.textarea, "py-[11px]"),
                  className,
                )}
                disabled={disabled}
                {...field}
                onBlur={(e) => {
                  field.onBlur();
                  handleCaretChange(e);
                }}
                ref={field.ref}
                {...props}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

ConfigPanelAutosizeTextareaField.displayName = "ConfigPanelAutosizeTextareaField";

export { ConfigPanelAutosizeTextareaField, type ConfigPanelAutosizeTextareaFieldProps };
