import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Switch } from "@/ui/components";
import { useIsInsideCrudDialog } from "@/ui/components/crud-dialog/CrudDialogContext";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/form";
import { cn } from "@/ui/lib";

import { crudDialogFieldClasses } from "../crud-dialog-field-classes";

interface SwitchFieldProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The label of the form field. */
  label: string;

  /** The description of the form field. */
  description: string;

  /** Whether to show the border around the switch field. */
  showBorder?: boolean;
}

/**
 * A custom switch form field component
 */
const SwitchField = ({
  name,
  label,
  size = "base",
  showBorder = true,
  description,
  disabled,
  ...props
}: SwitchFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();
  const isInDialog = useIsInsideCrudDialog() && size === "base";

  // Render the SwitchField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between gap-8 rounded-lg",
            showBorder && "border border-line",
            size === "xs" && "p-2.5 pt-1.5",
            size === "sm" && "p-2.5 pt-1.5",
            size === "base" && "p-4 pt-3.5",
            isInDialog && crudDialogFieldClasses.switchItem,
          )}
        >
          <div
            className={cn(
              size === "xs" && "space-y-0.5",
              size === "sm" && "space-y-0.5",
              size === "base" && "space-y-1",
            )}
          >
            <FormLabel
              className={cn(
                "font-medium",
                size === "xs" && "text-hint",
                size === "sm" && "text-[13px]/[18px]",
                size === "base" && "text-body-sm",
                isInDialog && crudDialogFieldClasses.switchLabel,
              )}
            >
              {label}
            </FormLabel>
            <FormDescription
              size={size}
              className={cn(isInDialog && crudDialogFieldClasses.switchDescription)}
            >
              {description}
            </FormDescription>
          </div>

          <FormControl>
            <Switch
              size={isInDialog ? "sm" : size}
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
              {...field}
              ref={field.ref}
              {...props}
            />
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

SwitchField.displayName = "SwitchField";

export { SwitchField, type SwitchFieldProps };
