import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { FormFieldSizeType } from "@avplatform/ui/types";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import {
  ISearchableSelectOption,
  SearchableSelect,
} from "@/react-toolkit/ui/searchable-select/SearchableSelect";

type SearchableSelectFieldProps = BaseFieldProps & {
  name: FieldPath<FieldValues>;
  selectOptions: ISearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  primaryText?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  isLoading?: boolean;
  /** Rendered in place of the icon for select options whose `icon` is not set. */
  fallbackIcon?: React.ReactNode;
};

const SearchableSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  selectOptions,
  placeholder,
  searchPlaceholder,
  primaryText,
  isLoading,
  fallbackIcon,
}: SearchableSelectFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={size}>
          {label && <FormLabelExt {...{ size, label, disabled, isRequired, description }} />}

          <FormControl>
            <SearchableSelect
              value={field.value}
              onValueChange={field.onChange}
              options={selectOptions}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              primaryText={primaryText}
              disabled={disabled}
              size={size}
              isLoading={isLoading}
              fallbackIcon={fallbackIcon}
            />
          </FormControl>

          <FormMessage size={size} />
        </FormItem>
      )}
    />
  );
};

SearchableSelectField.displayName = "SearchableSelectField";

export { SearchableSelectField, type SearchableSelectFieldProps };
