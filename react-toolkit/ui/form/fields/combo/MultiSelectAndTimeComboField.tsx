import {
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
} from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { FieldValues, useFormContext } from "react-hook-form";

import { FormCustomMessage } from "../../FormCustomMessage";
import { MultiSelectField, MultiSelectFieldProps } from "../MultiSelectField";
import { TimePickerField, TimePickerFieldProps } from "../TimePickerField";

export type MultiSelectAndTimeComboFieldProps = {
  label?: string;
  containerClassName?: string;
  selectContainerClassName?: string;
  timeContainerClassName?: string;
  isRequired?: boolean;
  disabled?: boolean;
  size?: "base" | "sm" | "xs";
  selectFieldProps: MultiSelectFieldProps;
  timePickerProps: TimePickerFieldProps;
};

/**
 * A custom select form field component with label (if provided)
 */
export const MultiSelectAndTimeComboField = ({
  label,
  containerClassName,
  selectContainerClassName,
  timeContainerClassName,
  isRequired,
  size = "base",
  disabled,
  selectFieldProps,
  timePickerProps,
}: MultiSelectAndTimeComboFieldProps) => {
  // Get the form context
  const {
    control: controlForSelect,
    getFieldState: getSelectFieldState,
    formState,
  } = useFormContext<FieldValues>();

  //add control for the form
  const { control: controlForTime, getFieldState: getInputFieldState } =
    useFormContext<FieldValues>();

  //state of the inputs
  const selectFieldState = getSelectFieldState(
    selectFieldProps.name,
    formState,
  );

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
      <div className={cn("grid grid-cols-4 space-x-2", containerClassName)}>
        <div
          className={cn(
            "col-span-3 items-stretch",
            timePickerProps.label ? "mt-[1.4rem]" : "mt-[.2rem]",
            selectContainerClassName,
          )}
        >
          <FormField
            {...{ name: selectFieldProps.name, control: controlForSelect }}
            render={({ field }) => (
              <FormItem {...{ size: size }}>
                <FormControl>
                  <MultiSelectField
                    {...field}
                    {...selectFieldProps}
                    disabled={selectFieldProps.disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className={cn("me-5", timeContainerClassName)}>
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
        </div>
      </div>
      <FormCustomMessage
        fieldStates={[selectFieldState, inputFieldState]}
        {...{ size: size }}
      />
    </div>
  );
};
