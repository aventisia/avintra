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
import { ModelsListDto } from "../../dtos/models-table-dto";
import { getModels } from "../../apis/models-apis";
import { Button } from "@aventisia/ui/buttons";

interface ModelSelectFieldProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}
interface ModelSelectFieldOptionsProps extends ISelectOption {
  /** The description of the form field. */
  llm?: string;
}

function generateSelectOptions(
  data: ModelsListDto[],
): ModelSelectFieldOptionsProps[] {
  return data.map((item) => ({
    description: item.description || "",
    label: item.name,
    value: item.id || "",
    llm: item.llm || "",
  }));
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

  const [selectOptions, setSelectOptions] = useState<
    (ISelectOption & { llm?: string })[]
  >([]);

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

  // 👀 Watch the selected value from the form
  // const selectedValue = watch(name);

  // 🔎 Find selected option details
  // const selectedOption = selectOptions.find(
  //   (option) => option.value === selectedValue,
  // );

  return (
    <>
      <FormField
        {...{ name, control }}
        render={({ field }) => (
          <FormItem {...{ size }}>
            {label && (
              <div className="flex items-center justify-between">
                <FormLabelExt
                  {...{ size, label, disabled, isRequired, description }}
                ></FormLabelExt>

                <Button
                  variant={"link"}
                  size={"sm"}
                  onClick={() => {
                    window.open(
                      `${import.meta.env.VITE_WORC_PATH}ai-models`,
                      "_blank",
                    );
                  }}
                >
                  + Create new model
                </Button>
              </div>
            )}
            <FormControl>
              <div className="flex flex-col gap-2">
                <Select
                  disabled={disabled}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger
                    size={size}
                    {...field}
                    ref={field.ref}
                    {...props}
                  >
                    <SelectValue placeholder={placeholder ?? "Select"} />
                  </SelectTrigger>

                  <SelectContent>
                    {selectOptions.map((item) => (
                      <SelectItem
                        size={size}
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 💡 Show LLM as badge when available */}
                {/* {selectedOption?.llm && (
                <div className="mt-1 ml-1">
                  <Badge variant="default">{selectedOption.llm}</Badge>
                </div>
              )}*/}
              </div>
            </FormControl>

            <FormMessage {...{ size }} />
          </FormItem>
        )}
      />
    </>
  );
};

ModelSelectField.displayName = "ModelSelectField";

export { ModelSelectField, type ModelSelectFieldProps };
