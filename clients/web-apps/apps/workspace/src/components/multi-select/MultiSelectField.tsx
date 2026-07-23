import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { FormFieldSizeType, ISelectOption } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { MultiSelect } from "./MultiSelect";

interface MultiSelectFieldProps extends BaseFieldProps {
  name: FieldPath<FieldValues>;
  selectOptions: ISelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
}

const MultiSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  placeholder,
  searchPlaceholder,
}: MultiSelectFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={size}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}

          <FormControl>
            <MultiSelect
              value={field.value || []}
              onValueChange={field.onChange}
              options={selectOptions}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              disabled={disabled}
              size={size}
            />
          </FormControl>

          <FormMessage size={size} />
        </FormItem>
      )}
    />
  );
};

MultiSelectField.displayName = "MultiSelectField";

export { MultiSelectField, type MultiSelectFieldProps };
