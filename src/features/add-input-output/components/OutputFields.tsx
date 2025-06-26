import { Button } from "@aventisia/ui/buttons";
import {
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
} from "../constants/inputs-outputs-zod-schema";
import { Control, Controller, UseFieldArrayRemove } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { InputField } from "@aventisia/ui/form";

interface OutputFieldsProps extends OutputFieldFormValues {
  id: string;
}
const OutputFields = ({
  field,
  control,
  index,
  remove,
}: {
  field: OutputFieldsProps;
  control: Control<InputsOutputsFieldsFormType>;
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  return (
    <div
      key={field.id}
      className="relative mt-3 grid grid-cols-2 items-center gap-2.5 rounded-lg border bg-slate-50 p-4 first:mt-0"
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
        name={`outputs.${index}.name`}
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
        name={`outputs.${index}.label`}
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
        name={`outputs.${index}.defaultValue`}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="xs"
            label="Default value"
            description="Initial value for the field"
          />
        )}
      />

      <Controller
        name={`outputs.${index}.description`}
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
  );
};

export default OutputFields;
