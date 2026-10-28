/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@avplatform/ui/buttons";
import { InputField } from "@avplatform/ui/form";
import { Trash2 } from "lucide-react";
import { Control, Controller, UseFieldArrayRemove } from "react-hook-form";

import { OutputFieldFormValues } from "../constants/inputs-outputs-zod-schema";

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
  control: Control<any>;
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  return (
    <div
      key={field.id}
      className="mb-3 grid grid-cols-2 items-center gap-2.5 rounded-lg border bg-sunken p-4"
    >
      <div className="col-span-2 flex justify-between">
        <span className="text-sm">Output {index + 1}</span>
        <Button
          variant="ghost"
          type="button"
          size="xs"
          onClick={() => remove(index)}
          className="text-bad hover:bg-bad/10 hover:text-bad"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Name Field */}
      <Controller
        name={`outputs.${index}.name`}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="xs"
            description="Unique identifier for the field "
            label="Output variable"
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
