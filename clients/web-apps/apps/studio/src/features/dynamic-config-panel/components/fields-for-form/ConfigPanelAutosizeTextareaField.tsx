import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import * as React from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";

import { ConfigPanelAutosizeTextarea } from "../..";
import { useVariableInsertion } from "../../hooks/useVariableInsertion.hook";
import { VariablesTrigger } from "./VariablesTrigger";

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

  // Insert the selected variable into the textarea at the caret position
  useVariableInsertion(name, (token) => {
    const pos = caretRef.current;

    if (textareaField.value === undefined) {
      textareaField.onChange(token);
    } else {
      textareaField.onChange(
        textareaField.value.slice(0, pos) + token + textareaField.value.slice(pos),
      );
    }

    // TODO: Restore focus and move caret after inserted text
    // requestAnimationFrame(() => {
    //   el.focus();
    //   const caretEnd = pos + token.length;
    //   el.setSelectionRange(caretEnd, caretEnd);
    // });
  });

  // Render the AutosizeTextareaField component
  return (
    <VariableSelectorWrapper inputUniqueName={name}>
      <div className="group relative">
        <VariablesTrigger name={name} className={label ? "top-0" : "-top-5"} />
        <FormField
          {...{ name, textareaField }}
          render={({ field }) => (
            <FormItem>
              {label && <FormLabelExt {...{ label, disabled, isRequired, description }} />}

              <FormControl>
                <ConfigPanelAutosizeTextarea
                  size="sm"
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                  className={cn("h-8", className)}
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
    </VariableSelectorWrapper>
  );
};

ConfigPanelAutosizeTextareaField.displayName = "ConfigPanelAutosizeTextareaField";

export { ConfigPanelAutosizeTextareaField, type ConfigPanelAutosizeTextareaFieldProps };
