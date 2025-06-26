import { Button } from "@aventisia/ui/buttons";
import {
  InputsOutputsFieldsFormType,
  FieldItemFormValues,
} from "../constants/inputs-outputs-zod-schema";
import {
  Control,
  Controller,
  UseFieldArrayRemove,
  useWatch,
} from "react-hook-form";
import { Trash2 } from "lucide-react";
import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";

interface InputFieldsProps extends FieldItemFormValues {
  id: string;
}

const InputFields = ({
  field,
  control,
  index,
  remove,
}: {
  field: InputFieldsProps;
  control: Control<InputsOutputsFieldsFormType>;
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  const type = useWatch({
    control,
    name: `inputs.${index}.type`,
  });

  return (
    <div
      key={field.id}
      className="relative mb-3 grid grid-cols-2 items-center gap-2.5 rounded-lg border bg-gray-50 p-4"
    >
      <Button
        variant="ghost"
        type="button"
        size="sm"
        onClick={() => remove(index)}
        className="absolute right-0 top-0 text-red-500 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Name Field */}
      <Controller
        name={`inputs.${index}.name`}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="xs"
            description="Unique identifier for the field "
            label="Name"
          />
        )}
      />
      <Controller
        name={`inputs.${index}.label`}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="xs"
            description="User-friendly name displayed in the form UI"
            label="Label"
          />
        )}
      />
      <Controller
        name={`inputs.${index}.defaultValue`}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="xs"
            description="Initial value for the field"
            label="Default Value"
          />
        )}
      />

      <Controller
        name={`inputs.${index}.type`}
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            label="Field Type"
            description="Select the input type"
            size="xs"
            selectOptions={[
              { label: "TextBox", value: "text" },
              { label: "Select (Dropdown)", value: "select" },
              { label: "Toggle (Switch)", value: "switch" },
            ]}
          />
        )}
      />
      {["select"].includes(type) && (
        <div className="col-span-2">
          <Controller
            name={`inputs.${index}.selectOptions`}
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                fieldSize="xs"
                description="Enter semicolon-separated options for the select input (e.g., 'Red; Green; Blue')"
                label="Select Options"
              />
            )}
          />
        </div>
      )}

      <div className="col-span-2">
        <Controller
          name={`inputs.${index}.required`}
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <SwitchField
              label="Is Required"
              size="xs"
              description="Mark this field as required"
              value={value ? "true" : "false"} // convert to string
              onChange={onChange}
              {...rest}
            />
          )}
        />
      </div>
      <div className="col-span-2">
        <Controller
          name={`inputs.${index}.description`}
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              fieldSize="xs"
              description="Optional helper text"
              label="Description"
            />
          )}
        />
      </div>
    </div>
  );
};

export default InputFields;
