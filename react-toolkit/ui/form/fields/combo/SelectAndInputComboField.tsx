import { Input } from "@aventisia/ui";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem, FormLabelExt, InputFieldProps } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { FieldValues, useFormContext } from "react-hook-form";

import { AsyncSelect } from "../../../async-select";
import { FormCustomMessage } from "../../FormCustomMessage";
import { AsyncSelectFieldProps } from "../AsyncSelectField";

export type SelectAndInputComboField = {
  selectFieldProps: AsyncSelectFieldProps;
  inputFieldProps: InputFieldProps;
};

/**
 * A custom select form field component with label (if provided)
 */
export const SelectAndInputComboField = ({
  selectFieldProps,
  inputFieldProps,
}: SelectAndInputComboField) => {
  // Get the form context
  const {
    control: controlForSelect,
    setValue,
    getFieldState: getSelectFieldState,
    formState,
  } = useFormContext<FieldValues>();

  //add control for the form
  const { control: controlForInput, getFieldState: getInputFieldState } =
    useFormContext<FieldValues>();

  //state of the inputs
  const selectFieldState = getSelectFieldState(
    selectFieldProps.name,
    formState,
  );

  const inputFieldState = getInputFieldState(inputFieldProps.name, formState);

  // Render the mponent
  return (
    <div className="flex flex-col">
      {selectFieldProps.label && (
        <FormLabelExt
          {...{
            size: selectFieldProps.size,
            label: selectFieldProps.label,
            disabled: selectFieldProps.disabled,
            isRequired: selectFieldProps.isRequired,
            description: selectFieldProps.description,
          }}
        />
      )}
      <div className="grid grid-cols-3">
        <span>
          <FormField
            {...{ name: selectFieldProps.name, control: controlForSelect }}
            render={({ field }) => (
              <FormItem {...{ size: selectFieldProps.size }}>
                <FormControl>
                  <AsyncSelect
                    {...selectFieldProps}
                    className={cn(selectFieldProps.className, "ml-28")}
                    selectOptions={selectFieldProps.selectOptions}
                    label={selectFieldProps.label}
                    value={field.value}
                    disabled={selectFieldProps.disabled || field.disabled}
                    notFound={selectFieldProps.notFound}
                    onChange={(value) => {
                      setValue(selectFieldProps.name, value, {
                        shouldDirty: true,
                      });
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </span>
        <span className="col-span-2">
          <FormField
            {...{ name: inputFieldProps.name, control: controlForInput }}
            render={({ field }) => (
              <FormItem {...{ size: selectFieldProps.size }}>
                <FormControl>
                  <Input
                    fieldSize={inputFieldProps.fieldSize}
                    type={inputFieldProps.type}
                    className={cn(inputFieldProps.className, "rounded-l-none")}
                    disabled={inputFieldProps.disabled}
                    {...inputFieldProps}
                    {...field}
                    ref={field.ref}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </span>
      </div>
      <FormCustomMessage
        fieldStates={[selectFieldState, inputFieldState]}
        {...{ size: selectFieldProps.size }}
      />
    </div>
  );
};
