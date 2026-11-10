import { useIsInsideCrudDialog } from "@avplatform/ui/crud-dialog";
import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  crudDialogFieldClasses,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType, ISelectOption } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { SearchableSelect } from "./SearchableSelect";

interface SearchableSelectFieldProps extends BaseFieldProps {
  name: FieldPath<FieldValues>;
  selectOptions: ISelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  primaryText?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  isLoading?: boolean;
}

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
}: SearchableSelectFieldProps) => {
  const { control } = useFormContext<FieldValues>();
  const isInDialog = useIsInsideCrudDialog() && size === "base";

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={size} className={cn(isInDialog && crudDialogFieldClasses.item)}>
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
              triggerClassName={cn(isInDialog && crudDialogFieldClasses.selectTrigger)}
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
