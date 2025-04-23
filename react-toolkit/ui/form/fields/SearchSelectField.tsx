import { FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/react-toolkit/lib/utils";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";

import { AsyncSelect } from "../../async-select";
import {
  AsyncSelectFieldProps,
  DefaultAsyncSelectFieldgetDisplayValue,
  DefaultAsyncSelectFieldRenderOption,
} from "./AsyncSelectField";

export type SearchSelectFieldProps = {
  selectOptions: ISelectOption[];
} & Omit<AsyncSelectFieldProps, "fetcher"> &
  BaseFieldProps;

/**
 * A custom select form field component with label (if provided)
 */
export const SearchSelectField = ({
  name,
  label,
  placeholder = "Select...",
  disabled,
  size = "base",
  isRequired,
  selectOptions,
  description,
  className,
  renderOption = DefaultAsyncSelectFieldRenderOption,
  getDisplayValue = DefaultAsyncSelectFieldgetDisplayValue,
  notFound = (
    <div className="py-2 text-center text-sm lowercase">No {label} Found</div>
  ),
  triggerClassName: riggerClassName,
}: SearchSelectFieldProps) => {
  // Get the form context
  const { control, setValue } = useFormContext<FieldValues>();

  const searchOptions = async (query?: string): Promise<ISelectOption[]> => {
    await new Promise((resolve) => setTimeout(resolve, 3));

    if (query) {
      const lowercaseQuery = query.toLowerCase();
      return selectOptions
        .filter((option) => option.label.toLowerCase().includes(lowercaseQuery))
        .slice(0, 10); // Return only first 10 matches
    }

    return selectOptions.slice(0, 10);
  };

  // Render the mponent
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => {
        return (
          <FormItem {...{ size }}>
            {label && (
              <FormLabelExt
                {...{ size, label, disabled, isRequired, description }}
              />
            )}
            <FormControl>
              <AsyncSelect
                label={label}
                value={field.value.toLowerCase()}
                placeholder={placeholder}
                onChange={(value) => {
                  setValue(name, value, {
                    shouldDirty: true,
                  });
                  field.onChange(value);
                }}
                disabled={disabled || field.disabled}
                fetcher={searchOptions}
                getOptionValue={(option) => option.value.toLowerCase()}
                renderOption={renderOption}
                getDisplayValue={getDisplayValue}
                notFound={notFound}
                className={cn("!w-[28rem]", className)}
                triggerClassName={cn("!w-full", riggerClassName)}
              />
            </FormControl>

            <FormMessage {...{ size }} />
          </FormItem>
        );
      }}
    />
  );
};
