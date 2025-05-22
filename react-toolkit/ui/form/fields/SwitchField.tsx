import { cn } from "@aventisia/ui/lib";
import { FormControl } from "@aventisia/ui/form";
import { FormDescription } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormLabel } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { Switch } from "@/react-toolkit/ui/switch";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface SwitchFieldProps
  extends React.ComponentPropsWithoutRef<typeof Switch> {
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

  // Render the SwitchField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between gap-8 rounded-lg",
            showBorder && "border",
            size === "xs" && "p-2.5 pt-1.5",
            size === "sm" && "p-2.5 pt-1.5",
            size === "base" && "p-4 pt-3.5",
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
                size === "xs" && "text-2xs",
                size === "sm" && "text-xs",
                size === "base" && "text-sm",
              )}
            >
              {label}
            </FormLabel>
            <FormDescription size={size}>{description}</FormDescription>
          </div>

          <FormControl>
            <Switch
              size={size}
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
              {...props}
              {...field}
              ref={field.ref}
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
