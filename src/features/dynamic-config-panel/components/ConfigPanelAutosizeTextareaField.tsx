import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";
import { useVariableSelectorStore } from "@/stores/variable-selector-store";
import { buttonVariants } from "@aventisia/ui/buttons";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { VariableIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { ConfigPanelAutosizeTextarea } from "./ConfigPanelAutosizeTextarea";

interface ConfigPanelAutosizeTextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof ConfigPanelAutosizeTextarea>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
}

/**
 * A custom autosize textarea form field component with label (if provided)
 */
const ConfigPanelAutosizeTextareaField = ({
  name,
  minHeight,
  maxHeight = 200,
  label,
  isRequired,
  description,
  className,
  disabled,
  ...props
}: ConfigPanelAutosizeTextareaFieldProps) => {
  // Get variable selector store state and actions
  const { setOpenState, setInputName } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setInputName: state.setInputName,
    })),
  );

  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the AutosizeTextareaField component
  return (
    <VariableSelectorWrapper inputUniqueName={name}>
      <div className="group relative">
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "absolute right-1.5 h-5 gap-1 rounded-none rounded-t-lg border-none bg-accent px-2 text-xs opacity-0 hover:text-primary group-focus-within:opacity-100",
            "data-[state=open]:opacity-100",
          )}
          onClick={() => {
            setInputName(name);
            setOpenState(true);
          }}
        >
          <VariableIcon className="h-3 w-3 stroke-[2.4]" />
          Variables
        </PopoverTrigger>
        <FormField
          {...{ name, control }}
          render={({ field }) => (
            <FormItem>
              {label && (
                <FormLabelExt
                  {...{ label, disabled, isRequired, description }}
                />
              )}

              <FormControl>
                <ConfigPanelAutosizeTextarea
                  size="sm"
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                  className={cn("h-8", className)}
                  disabled={disabled}
                  {...field}
                  ref={field.ref}
                  {...props}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </VariableSelectorWrapper>
  );
};

ConfigPanelAutosizeTextareaField.displayName =
  "ConfigPanelAutosizeTextareaField";

export {
  ConfigPanelAutosizeTextareaField,
  type ConfigPanelAutosizeTextareaFieldProps
};

