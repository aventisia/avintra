import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";
import { useVariableSelectorStore } from "@/stores/variable-selector-store";

import { Switch } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import { FormControl, FormField, FormItem } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { Tooltip } from "@aventisia/ui/tooltip";
import {
  InformationCircleIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { ConfigPanelAutosizeInput } from "../..";

interface ConfigPanelModelOutputFieldProps
  extends React.ComponentPropsWithoutRef<typeof ConfigPanelAutosizeInput> {
  /** The name of the form field. */
  name: string;

  /** The description of the form field. */
  description?: string;
}

const ConfigPanelModelOutputField = ({
  name,
  description,
  disabled,
  ...props
}: ConfigPanelModelOutputFieldProps) => {
  // Get variable selector store state and actions
  const {
    inputName,
    selectedValue,
    setSelectedValue,
    setOpenState,
    setInputName,
  } = useVariableSelectorStore(
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
  useEffect(() => {
    if (selectedValue && inputName === name) {
      valueField.onChange(selectedValue);
      setSelectedValue(""); // Reset selectedValue in the store
    }
  }, [selectedValue, valueField, setSelectedValue, inputName, name]);

  // Render the ConfigPanelModelOutputField component
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
                  <Tooltip
                    className="max-w-[50vw] bg-white"
                    content={
                      <JsonViewer
                        jsonData={description}
                        className="h-[calc(50vh)] w-full p-1"
                      />
                    }
                  >
                    <div className="rounded hover:bg-slate-100 hover:text-primary">
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

ConfigPanelModelOutputField.displayName = "ConfigPanelModelOutputField";

export { ConfigPanelModelOutputField, type ConfigPanelModelOutputFieldProps };
