import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/literal-types";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { RadioGroup, RadioGroupItem } from "@/react-toolkit/ui/radio-group";

import { Label } from "../../label";

export type RenderOptionProps = React.ReactElement<typeof RadioGroupItem> &
  React.ReactElement<typeof Label>;
export interface RadioCardGroupFieldProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroup>,
    BaseFieldProps {
  size?: FormFieldSizeType;

  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the select field. */
  selectOptions: ISelectOption[];

  renderOptions?: (options: ISelectOption[]) => RenderOptionProps;

  onValueChange?: (value: string) => void;
  hideRadioButton?: boolean;
}

/**
 * A custom select form field component with label (if provided)
 */
export const RadioCardGroupField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  onValueChange,
  disabled,
  selectOptions,
  hideRadioButton = false,
  ...props
}: RadioCardGroupFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();
  const id = React.useId();

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
              "flex flex-col items-start justify-between rounded-lg",
              size === "xs" && "p-2.5",
              size === "sm" && "p-2.5",
              size === "base" && "p-0",
            )}
          >
            <RadioGroup
              {...props}
              {...field}
              ref={field.ref}
              disabled={disabled}
              onValueChange={(value) => {
                onValueChange?.(value);
                field.onChange(value);
              }}
              defaultValue={field.value}
              className={cn(
                "flex !flex-row !justify-items-stretch",
                size === "xs" && "gap-1.5",
                size === "sm" && "gap-1.5",
                size === "base" && "gap-2",
              )}
            >
              {props.renderOptions?.(selectOptions)}

              {selectOptions?.map((item) => (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-center",
                    disabled ? "bg-slate-300" : "bg-white",
                    size === "xs" && "gap-1.5 p-1",
                    size === "sm" && "gap-1.5 p-2",
                    size === "base" && "gap-2.5 p-3",
                    "has-[[data-state=checked]]:border-1 relative w-full items-start rounded-lg border border-input shadow-sm shadow-black/5 has-[[data-state=checked]]:border-primary",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`${id}-${item.value}`}
                      value={item.value}
                      hidden={hideRadioButton}
                      className={cn("after:absolute after:inset-0")}
                    />

                    <Label htmlFor={`${id}-${item.value}`}>{item.label}</Label>
                  </div>
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

RadioCardGroupField.displayName = "RadioGroupField";
