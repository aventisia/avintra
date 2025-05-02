import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { BaseFieldProps } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { AsyncSelect, AsyncSelectProps } from "../../async-select";

export type AsyncSelectOptionalProps =
  | "renderOption"
  | "getDisplayValue"
  | "getOptionValue"
  | "onChange"
  | "value"
  | "notFound";

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[Keys];

export type AsyncSelectFieldProps = {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  selectOptions: (query?: string) => Promise<ISelectOption[]>;

  size: "base" | "xs" | "sm";
} & Partial<Pick<AsyncSelectProps<ISelectOption>, AsyncSelectOptionalProps>> &
  Omit<AsyncSelectProps<ISelectOption>, AsyncSelectOptionalProps | "fetcher"> &
  BaseFieldProps;

/**
 * A custom select form field component with label (if provided)
 */
export const AsyncSelectField = ({
  name,
  label,
  disabled,
  size = "base",
  isRequired,
  selectOptions,
  description,

  ...props
}: AsyncSelectFieldProps) => {
  // Get the form context
  const { control, setValue } = useFormContext<FieldValues>();

  // Render the mponent
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
          <FormControl>
            <AsyncSelect
              {...props}
              selectOptions={selectOptions}
              label={label}
              value={field.value}
              disabled={disabled || field.disabled}
              onChange={(value) => {
                setValue(name, value, {
                  shouldDirty: true,
                });
                field.onChange(value);
              }}
            />
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};
