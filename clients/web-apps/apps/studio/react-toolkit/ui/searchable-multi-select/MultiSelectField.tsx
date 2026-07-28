import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import {
  ActionSelectProps,
  MultiSelectCombobox,
  Option,
} from "./MultiSelectCombobox";

interface MultiSelectFieldProps extends BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  /** Options for the multiselect dropdown */
  options: Option[];
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Optional inline select configuration */
  actionSelect?: ActionSelectProps;

  fieldSize?: FormFieldSizeType;

  className?: string;
  disabled?: boolean;
}

/**
 * A custom multi-select combobox form field component with label (if provided)
 * Designed to integrate seamlessly with the design system's RHF implementation.
 */
const MultiSelectField = ({
  name,
  label,
  options,
  fieldSize = "base",
  isRequired,
  description,
  className,
  disabled,
  placeholder,
  actionSelect,
}: MultiSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the component matching the exact architecture of InputField
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
            <MultiSelectCombobox
              options={options}
              value={field.value || []}
              onChange={field.onChange}
              placeholder={placeholder}
              actionSelect={actionSelect}
              fieldSize={fieldSize}
              className={cn(className)}
              disabled={disabled}
            />
          </FormControl>

          <FormMessage size={fieldSize} />
        </FormItem>
      )}
    />
  );
};

MultiSelectField.displayName = "MultiSelectField";

export { MultiSelectField, type MultiSelectFieldProps };
