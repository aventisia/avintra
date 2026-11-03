import { InfoIcon } from "@phosphor-icons/react";
import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { RadioGroup, RadioGroupItem } from "@/ui/components/radio-group";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType, type ISelectOption } from "@/ui/types";

interface RadioGroupFieldProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroup>, BaseFieldProps {
  size?: FormFieldSizeType;

  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the select field. */
  selectOptions: ISelectOption[];
}

/**
 * A custom select form field component with label (if provided)
 */
const RadioGroupField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  ...props
}: RadioGroupFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the RadioGroupField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
          <FormControl
            className={cn(
              "flex flex-col items-start justify-between rounded-lg border",
              size === "xs" && "p-2.5",
              size === "sm" && "p-2.5",
              size === "base" && "p-4",
            )}
          >
            <RadioGroup
              {...field}
              ref={field.ref}
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={cn(
                "flex flex-col",
                size === "xs" && "gap-1.5",
                size === "sm" && "gap-1.5",
                size === "base" && "gap-3",
              )}
              {...props}
            >
              {selectOptions?.map((item) => (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-center",
                    size === "xs" && "gap-1.5",
                    size === "sm" && "gap-1.5",
                    size === "base" && "gap-2.5",
                  )}
                >
                  <RadioGroupItem size={size} value={item.value} />

                  <p
                    className={cn(
                      size === "xs" && "text-2xs",
                      size === "sm" && "text-xs",
                      size === "base" && "text-sm",
                    )}
                  >
                    {item.label}
                  </p>
                  {item.description && (
                    <Tooltip
                      content={item.description}
                      className={cn(
                        size === "xs" && "text-2xs",
                        size === "sm" && "text-xs",
                        size === "base" && "text-sm",
                      )}
                    >
                      <InfoIcon
                        className={cn(
                          size === "xs" && "h-3 w-3",
                          size === "sm" && "h-3.5 w-3.5",
                          size === "base" && "h-4 w-4",
                        )}
                      />
                    </Tooltip>
                  )}
                </div>
              ))}
            </RadioGroup>
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

RadioGroupField.displayName = "RadioGroupField";

export { RadioGroupField, type RadioGroupFieldProps };
