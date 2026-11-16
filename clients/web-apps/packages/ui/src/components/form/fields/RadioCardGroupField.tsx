import {
  type BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { Label } from "@avplatform/ui/label";
import { cn } from "@avplatform/ui/lib";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";
import { type FormFieldSizeType, type ISelectOption } from "@avplatform/ui/types";
import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

export type RenderOptionProps = React.ReactElement<typeof RadioGroupItem> &
  React.ReactElement<typeof Label>;
export interface RadioCardGroupFieldProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroup>, BaseFieldProps {
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
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
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
              value={field.value}
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
                    disabled ? "bg-sunken" : "bg-surface",
                    size === "xs" && "gap-1.5 p-1",
                    size === "sm" && "gap-1.5 p-2",
                    size === "base" && "gap-2.5 p-3",
                    "relative w-full items-start rounded-lg border border-line-strong transition-colors duration-[120ms] ease-out has-[[data-state=checked]]:border-indicator has-[[data-state=checked]]:bg-selected",
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
