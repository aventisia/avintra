import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { AsyncSingleSelect, type AsyncSingleSelectProps } from "@/ui/components";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { type FormFieldSizeType } from "@/ui/types";

interface AsyncSingleSelectFieldProps<TItem, TFilters = undefined>
  extends
    Omit<AsyncSingleSelectProps<TItem, TFilters>, "selectedItem" | "onSelect" | "size">,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Size variant for label, message and control. */
  size?: FormFieldSizeType;

  /** Overrides the form value as the selected item. */
  selectedItem?: TItem | null;

  /** Receives the selected item instead of writing it into the form value. */
  onSelect?: (item: TItem | null) => void;
}

/**
 * Form-bound async single-select field.
 */
export const AsyncSingleSelectField = <TItem, TFilters = undefined>({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  nonErrorMessage,
  selectedItem,
  onSelect,
  ...props
}: AsyncSingleSelectFieldProps<TItem, TFilters>) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={size}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}

          <FormControl>
            <AsyncSingleSelect<TItem, TFilters>
              {...props}
              size={size}
              disabled={disabled}
              selectedItem={
                selectedItem !== undefined
                  ? selectedItem
                  : ((field.value as TItem | null | undefined) ?? null)
              }
              onSelect={onSelect ?? field.onChange}
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

AsyncSingleSelectField.displayName = "AsyncSingleSelectField";

export type { AsyncSingleSelectFieldProps };
