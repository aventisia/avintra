import {
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  InputField,
  type InputFieldProps,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { type FieldValues, useFormContext } from "react-hook-form";

import { TimePickerField, type TimePickerFieldProps } from "../TimePickerField";

export type InputAndTimeComboFieldProps = {
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  size?: "base" | "sm" | "xs";
  inputFieldProps: InputFieldProps;
  timePickerProps: TimePickerFieldProps;
};

/**
 * A custom select form field component with label (if provided)
 */
export const InputAndTimeComboField = ({
  label,
  isRequired,
  disabled,
  size,
  inputFieldProps,
  timePickerProps,
}: InputAndTimeComboFieldProps) => {
  // Get the form context
  const { control: controlForInput } = useFormContext<FieldValues>();

  //add control for the form
  const { control: controlForTime } = useFormContext<FieldValues>();

  // Render the mponent
  return (
    <div className="flex flex-col">
      {label && (
        <FormLabelExt
          {...{
            label: label,
            disabled: disabled,
            isRequired: isRequired,
          }}
        />
      )}
      <div className="grid grid-cols-3 gap-x-4">
        <span className={cn("col-span-2")}>
          <FormField
            {...{ name: inputFieldProps.name, control: controlForInput }}
            render={({ field }) => (
              <FormItem {...{ size: size }}>
                <FormControl>
                  <InputField
                    fieldSize={inputFieldProps.fieldSize}
                    type={inputFieldProps.type}
                    className={cn(inputFieldProps.className)}
                    disabled={inputFieldProps.disabled}
                    {...inputFieldProps}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </span>
        <span>
          <FormField
            {...{ name: timePickerProps.name, control: controlForTime }}
            render={({ field }) => (
              <FormItem {...{ size: size }}>
                <FormControl>
                  <TimePickerField
                    fieldSize={timePickerProps.fieldSize}
                    disabled={timePickerProps.disabled}
                    {...timePickerProps}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </span>
      </div>
    </div>
  );
};
