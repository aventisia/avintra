import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { AsyncMultiSelect, type AsyncMultiSelectProps } from "@/ui/components";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { type FormFieldSizeType } from "@/ui/types";

interface AsyncMultiSelectFieldProps<TItem, TFilters = undefined>
  extends
    Omit<AsyncMultiSelectProps<TItem, TFilters>, "selectedItems" | "onSelectMultiple" | "size">,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Size variant for label, message and control. */
  size?: FormFieldSizeType;
}

/**
 * Form-bound async multi-select field.
 */
export const AsyncMultiSelectField = <TItem, TFilters = undefined>({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
  ...props
}: AsyncMultiSelectFieldProps<TItem, TFilters>) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={size}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}

          <FormControl>
            <AsyncMultiSelect<TItem, TFilters>
              {...props}
              size={size}
              disabled={disabled}
              selectedItems={(field.value as TItem[] | undefined) ?? []}
              onSelectMultiple={field.onChange}
            />
          </FormControl>

          {nonErrorMessage ? (
            <FormMessage customMessageType={nonErrorMessage.type} size={size}>
              {nonErrorMessage.message}
            </FormMessage>
          ) : (
            <FormMessage size={size} />
          )}
        </FormItem>
      )}
    />
  );
};

AsyncMultiSelectField.displayName = "AsyncMultiSelectField";

export type { AsyncMultiSelectFieldProps };
