import { Info } from "lucide-react";
import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/ui/components/multi-selector";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type ISelectOption } from "@/ui/types";

interface MultiSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof MultiSelectorTrigger>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The select options for the multi-select field. */
  selectOptions: ISelectOption[];

  /** The placeholder for the multi-select field. */
  placeholder?: string;

  /**
   * Label to display when selected ids are present but options are still loading.
   * Defaults to "Loading..." to avoid flashing raw ids in badges.
   */
  unknownValueLabel?: string;

  /**
   * If true, show raw value as fallback when label isn't available yet.
   * Defaults to false.
   */
  showRawValueFallback?: boolean;

  /**
   * Optional override for the value-change handler. When provided, it replaces
   * the default `field.onChange`. Useful for enforcing mandatory/immutable values.
   */
  onValuesChange?: (value: string[]) => void;
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
  unknownValueLabel = "Loading...",
  showRawValueFallback = false,
  onValuesChange,
  ...props
}: MultiSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const valueLabelMap = React.useMemo(
    () => new Map(selectOptions.map((option) => [option.value, option.label])),
    [selectOptions],
  );

  // Render the MultiSelectField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}
          <MultiSelector
            onValuesChange={onValuesChange ?? field.onChange}
            values={field.value}
            valueToLabel={(val) =>
              valueLabelMap.get(val) ?? (showRawValueFallback ? val : unknownValueLabel)
            }
          >
            <FormControl>
              <MultiSelectorTrigger size={size} ref={field.ref} {...props}>
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
                      <MultiSelectorItem size={size} key={item.value} value={item.value}>
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
                              <Info className="h-4 w-4" />
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
