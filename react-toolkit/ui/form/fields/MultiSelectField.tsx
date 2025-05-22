import { cn } from "@aventisia/ui/lib";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@aventisia/ui/multi-selector";
import { Tooltip } from "@aventisia/ui/tooltip";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface MultiSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof MultiSelectorTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the multi-select field. */
  selectOptions: ISelectOption[];

  /** The placeholder for the multi-select field. */
  placeholder?: string;
}

/**
 * A custom multi-select form field component with label (if provided)
 */
const MultiSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  placeholder,
  ...props
}: MultiSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the MultiSelectField component
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
          <MultiSelector onValuesChange={field.onChange} values={field.value}>
            <FormControl>
              <MultiSelectorTrigger
                size={size}
                {...props}
                {...field}
                ref={field.ref}
              >
                <MultiSelectorInput
                  fieldSize={size}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              </MultiSelectorTrigger>
            </FormControl>
            {selectOptions?.length !== field.value?.length && (
              <MultiSelectorContent>
                <MultiSelectorList>
                  {selectOptions
                    ?.filter((option) => !field.value?.includes(option.value))
                    .map((item) => (
                      <MultiSelectorItem
                        size={size}
                        key={item.value}
                        value={item.value}
                      >
                        <div className="flex items-center gap-2">
                          {item.label}
                          {item.description && (
                            <Tooltip
                              content={item.description}
                              className={cn(
                                size === "xs" && "text-2xs",
                                size === "sm" && "text-xs",
                                size === "base" && "text-sm",
                              )}
                            >
                              <InformationCircleIcon className="h-4 w-4" />
                            </Tooltip>
                          )}
                        </div>
                      </MultiSelectorItem>
                    ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            )}
          </MultiSelector>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

MultiSelectField.displayName = "MultiSelectField";

export { MultiSelectField, type MultiSelectFieldProps };
