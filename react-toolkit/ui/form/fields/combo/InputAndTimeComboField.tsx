import {
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  InputField,
  InputFieldProps,
} from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { FieldValues, useFormContext } from "react-hook-form";

import { FormCustomMessage } from "../../FormCustomMessage";
import { TimePickerField, TimePickerFieldProps } from "../TimePickerField";

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
  const {
    control: controlForInput,
    getFieldState: getSelectFieldState,
    formState,
  } = useFormContext<FieldValues>();

  //add control for the form
  const { control: controlForTime, getFieldState: getInputFieldState } =
    useFormContext<FieldValues>();

  //state of the inputs
  const selectFieldState = getSelectFieldState(inputFieldProps.name, formState);

  const inputFieldState = getInputFieldState(timePickerProps.name, formState);

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
        <span
          className={cn(
            "col-span-2",
            timePickerProps.label ? "mt-[1.4rem]" : "mt-[.2rem]",
          )}
        >
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
      <FormCustomMessage
        fieldStates={[selectFieldState, inputFieldState]}
        {...{ size: size }}
      />
    </div>
  );
};
