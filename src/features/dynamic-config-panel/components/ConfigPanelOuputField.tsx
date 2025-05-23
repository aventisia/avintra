import { cn } from "@/react-toolkit/lib/utils";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { Switch } from "@/react-toolkit/ui/switch";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { Tooltip } from "../../../../react-toolkit/ui/custom/Tooltip";
import { AutosizeInput } from "./AutosizeInput";

interface ConfigPanelOuputFieldProps
  extends React.ComponentPropsWithoutRef<typeof AutosizeInput> {
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

  // Render the ConfigPanelOuputField component
  return (
    <div className="flex flex-row items-center justify-between gap-8 rounded-lg">
      <FormField
        {...{ name: valueFieldName, valueField }}
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-row items-center gap-1.5">
              <FormControl>
                <AutosizeInput
                  className={cn(
                    "h-auto w-auto rounded-xl bg-accent",
                    "p-[0.15rem] px-2.5 text-sm",
                  )}
                  disabled={disabled || !enabledField.value}
                  {...field}
                  {...props}
                  ref={field.ref}
                />
              </FormControl>

              {description ? (
                <Tooltip content={description}>
                  <div className="rounded hover:bg-slate-100 hover:text-primary">
                    <InformationCircleIcon className="h-3.5 w-3.5" />
                  </div>
                </Tooltip>
              ) : null}
            </div>
          </FormItem>
        )}
      />
      <FormField
        {...{ name: enabledFieldName, enabledField }}
        render={({ field }) => (
          <FormItem>
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
