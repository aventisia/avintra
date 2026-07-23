import { FormControl, FormField, FormItem, FormLabelExt } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { type FieldValues, useFormContext } from "react-hook-form";

import { MultiSelectField, type MultiSelectFieldProps } from "../MultiSelectField";
import { TimePickerField, type TimePickerFieldProps } from "../TimePickerField";

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
  const { control: controlForSelect } = useFormContext<FieldValues>();

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
      <div className={cn("flex space-x-2", containerClassName)}>
        <div className={cn("col-span-2 items-stretch", selectContainerClassName)}>
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
    </div>
  );
};
