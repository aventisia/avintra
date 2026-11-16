import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { useIsInsideCrudDialog } from "@/ui/components/crud-dialog/CrudDialogContext";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { cn } from "@/ui/lib";
import { type ISelectOption } from "@/ui/types";

import { crudDialogFieldClasses } from "../crud-dialog-field-classes";

interface SelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the select field. */
  selectOptions: ISelectOption[];

  /** The placeholder for the select field. */
  placeholder?: string;

  /** Match dropdown width to the trigger width. */
  matchPopoverWidth?: boolean;
}

/**
 * A custom select form field component with label (if provided)
 */
const SelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  placeholder,
  matchPopoverWidth = false,
  ...props
}: SelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();
  const isInDialog = useIsInsideCrudDialog() && size === "base";

  // Render the SelectField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={size} className={cn(isInDialog && crudDialogFieldClasses.item)}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
          <FormControl>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger
                size={size}
                {...field}
                ref={field.ref}
                {...props}
                className={cn(isInDialog && crudDialogFieldClasses.selectTrigger, props.className)}
              >
                <SelectValue placeholder={placeholder ?? "Select"} />
              </SelectTrigger>

              <SelectContent matchTriggerWidth={matchPopoverWidth}>
                {selectOptions.map((item) => (
                  <SelectItem
                    size={size}
                    key={item.value}
                    value={item.value}
                    description={item.description}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

SelectField.displayName = "SelectField";

export { SelectField, type SelectFieldProps };
