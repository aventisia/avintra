import { Switch } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { FormControl, FormField, FormItem } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { InformationCircleIcon, VariableIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";
import { useVariableSelectorStore } from "@/stores/variable-selector-store";

import { ConfigPanelAutosizeInput } from "../..";

interface ConfigPanelOuputFieldProps extends React.ComponentPropsWithoutRef<
  typeof ConfigPanelAutosizeInput
> {
  /** The name of the form field. */
  name: string;

  /** The description of the form field. */
  description?: string;
}

const ConfigPanelOuputField = ({
  name,
  description,
  disabled,
  ...props
}: ConfigPanelOuputFieldProps) => {
  // Get variable selector store state and actions
  const { inputName, selectedValue, setSelectedValue, setOpenState, setInputName } =
    useVariableSelectorStore(
      useShallow((state) => ({
        inputName: state.inputName,
        selectedValue: state.selectedValue,
        setSelectedValue: state.setSelectedValue,
        setOpenState: state.setOpenState,
        setInputName: state.setInputName,
      })),
    );

  // Set names for the fields
  const valueFieldName = `${name}.value` as FieldPath<FieldValues>;
  const enabledFieldName = `${name}.enabled` as FieldPath<FieldValues>;

  // Get the form context
  const { control } = useFormContext();

  // Use nested field names
  const { field: valueField } = useController({
    name: valueFieldName,
    control,
  });

  const { field: enabledField } = useController({
    name: enabledFieldName,
    control,
  });

  // Set AutosizeInput value when selectedValue changes
  React.useEffect(() => {
    if (selectedValue && inputName === name) {
      valueField.onChange(selectedValue);
      setSelectedValue(""); // Reset selectedValue in the store
    }
  }, [selectedValue, valueField, setSelectedValue, inputName, name]);

  // Render the ConfigPanelOuputField component
  return (
    <div className="flex flex-row items-center justify-between gap-8 rounded-lg">
      <FormField
        {...{ name: valueFieldName, valueField }}
        render={({ field }) => (
          <FormItem>
            <VariableSelectorWrapper inputUniqueName={name}>
              <div className="group flex flex-row items-center gap-1.5">
                <FormControl>
                  <ConfigPanelAutosizeInput
                    fieldSize="sm"
                    className={cn(
                      "z-10 h-auto w-auto rounded-xl bg-accent",
                      "p-[0.15rem] px-2.5 text-sm",
                    )}
                    disabled={disabled || !enabledField.value}
                    {...field}
                    ref={field.ref}
                    {...props}
                  />
                </FormControl>

                <PopoverTrigger
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "-ml-[3.75rem] h-[1.66rem] rounded-full pl-7 pr-2 text-xs opacity-0 group-focus-within:-ml-7 group-focus-within:opacity-100",
                    "data-[state=open]:-ml-7 data-[state=open]:opacity-100",
                  )}
                  onClick={() => {
                    setInputName(name);
                    setOpenState(true);
                  }}
                >
                  <VariableIcon className="h-4 w-4" />
                </PopoverTrigger>

                {description ? (
                  <Tooltip content={description}>
                    <div className="rounded hover:bg-hover hover:text-primary">
                      <InformationCircleIcon className="h-3.5 w-3.5" />
                    </div>
                  </Tooltip>
                ) : null}
              </div>
            </VariableSelectorWrapper>
          </FormItem>
        )}
      />
      <FormField
        {...{ name: enabledFieldName, enabledField }}
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormControl>
              <Switch
                size={"sm"}
                checked={field.value}
                onCheckedChange={field.onChange}
                {...field}
                ref={field.ref}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

ConfigPanelOuputField.displayName = "ConfigPanelOuputField";

export { ConfigPanelOuputField, type ConfigPanelOuputFieldProps };
