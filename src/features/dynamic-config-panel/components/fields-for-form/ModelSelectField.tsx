import {
  BaseFieldProps,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@aventisia/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { ISelectOption } from "@aventisia/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { ModelsTableDto } from "../../dtos/models-table-dto";
import { getModels } from "../../apis/models-apis";

interface ModelSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom select form field component with label (if provided)
 */
const ModelSelectField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: ModelSelectFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  function generateSelectOptions(data: ModelsTableDto[]): ISelectOption[] {
    return data.map((item) => ({
      description: item.description || "",
      label: item.name,
      value: item.id || "",
    }));
  }

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getModels()
      .then((data) => {
        setSelectOptions(generateSelectOptions(data.data));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch models", err);
        setLoading(false);
      });
  }, []);

  // Render the ModelSelectField component
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
          <FormControl>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger size={size} {...field} ref={field.ref} {...props}>
                <SelectValue
                  placeholder={placeholder ? "Select" : placeholder}
                />
              </SelectTrigger>

              <SelectContent>
                {selectOptions?.map((item) => (
                  <SelectItem size={size} key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

ModelSelectField.displayName = "ModelSelectField";

export { ModelSelectField, type ModelSelectFieldProps };
