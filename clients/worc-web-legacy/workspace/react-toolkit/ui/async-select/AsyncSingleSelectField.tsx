import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import { FormFieldSizeType } from "@aventisia/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { AsyncSingleSelect } from "./AsyncSingleSelect";
import { AsyncSingleSelectProps } from "./types";

interface AsyncSingleSelectFieldProps<TItem, TFilters = undefined>
  extends Omit<AsyncSingleSelectProps<TItem, TFilters>, "selectedItem" | "onSelect" | "size">,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** Size variant for label, message and control. */
  size?: FormFieldSizeType;
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
              selectedItem={(field.value as TItem | null | undefined) ?? null}
              onSelect={field.onChange}
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
