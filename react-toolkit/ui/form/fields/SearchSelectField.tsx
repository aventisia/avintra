import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/react-toolkit/lib/utils";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";

import { AsyncSelect } from "../../async-select";

export type SearchSelectFieldProps = {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  label: string;

  selectOptions: ISelectOption[];

  size: "base" | "xs" | "sm";

  className?: string;

  riggerClassName?: string;

  disabled?: boolean;
} & BaseFieldProps;

/**
 * A custom select form field component with label (if provided)
 */
export const SearchSelectField = ({
  name,
  label,
  disabled,
  size = "base",
  isRequired,
  selectOptions,
  description,
  className,
  riggerClassName,
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
                onChange={(value) => {
                  setValue(name, value, {
                    shouldDirty: true,
                  });
                  field.onChange(value);
                }}
                disabled={field.disabled}
                fetcher={searchOptions}
                renderOption={(option) => (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                )}
                getOptionValue={(option) => option.value.toLowerCase()}
                getDisplayValue={(option) => (
                  <div className="flex items-center gap-2 text-left">
                    <div className="flex flex-col leading-tight">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-2xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                )}
                notFound={
                  <div className="py-2 text-center text-sm">
                    {label} Not found
                  </div>
                }
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
