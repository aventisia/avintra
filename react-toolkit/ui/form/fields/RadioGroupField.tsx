import { cn } from "@aventisia/ui/lib";
import { FormFieldSizeType } from "@/react-toolkit/types/literal-types";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { RadioGroup, RadioGroupItem } from "@/react-toolkit/ui/radio-group";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface RadioGroupFieldProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroup>,
    BaseFieldProps {
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
          {label && (
            <FormLabelExt
              {...{ size, label, disabled, isRequired, description }}
            />
          )}
          <FormControl
            className={cn(
              "flex flex-col items-start justify-between rounded-lg border",
              size === "xs" && "p-2.5",
              size === "sm" && "p-2.5",
              size === "base" && "p-4",
            )}
          >
            <RadioGroup
              {...props}
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
                      <InformationCircleIcon
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
