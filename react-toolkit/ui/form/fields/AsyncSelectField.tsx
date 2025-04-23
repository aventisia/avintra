import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { ISelectOption } from "@/react-toolkit/types/select-option";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";

import { AsyncSelect, AsyncSelectProps } from "../../async-select";

export type AsyncSelectOptionalProps =
  | "renderOption"
  | "getDisplayValue"
  | "getOptionValue"
  | "onChange"
  | "value"
  | "notFound";

export type AsyncSelectFieldProps = {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  size: "base" | "xs" | "sm";
} & Partial<Pick<AsyncSelectProps<ISelectOption>, AsyncSelectOptionalProps>> &
  Omit<AsyncSelectProps<ISelectOption>, AsyncSelectOptionalProps> &
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
  description,
  renderOption = DefaultAsyncSelectFieldRenderOption,
  getDisplayValue = DefaultAsyncSelectFieldgetDisplayValue,
  getOptionValue = (option) => option.value,
  notFound = (
    <div className="py-2 text-center text-sm lowercase">No {label} Found</div>
  ),
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
              label={label}
              value={field.value}
              disabled={disabled || field.disabled}
              renderOption={renderOption}
              getDisplayValue={getDisplayValue}
              getOptionValue={getOptionValue}
              notFound={notFound}
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

export const DefaultAsyncSelectFieldRenderOption = (option: ISelectOption) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col">
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-muted-foreground">{option.description}</div>
    </div>
  </div>
);

export const DefaultAsyncSelectFieldgetDisplayValue = (
  option: ISelectOption,
) => (
  <div className="flex items-center gap-2 text-left">
    <div className="flex flex-col leading-tight">
      <div className="font-medium">{option.label}</div>
      <div className="text-xxs text-muted-foreground">{option.description}</div>
    </div>
  </div>
);

export const DefaultAsyncSelectFieldgetNotFoundComponent = () => (
  <div className="py-2 text-center text-sm">Not found</div>
);
