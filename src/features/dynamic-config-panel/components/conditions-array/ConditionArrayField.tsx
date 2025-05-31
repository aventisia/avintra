import { Button } from "@aventisia/ui/buttons";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DCPFieldSchemaType, RenderField, ConditionLabel } from "../..";

export const ConditionArrayField = (field: DCPFieldSchemaType) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  return (
    <div>
      {/* Render the condtions heading at the top */}
      <div className="flex items-center justify-between">
        {/* Heading */}
        <ConditionLabel
          label={field.label}
          description={field.description}
          className="text-base"
        />

        {/* Button to add a new condition group */}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="gap-1 text-xs text-primary hover:text-primary"
          onClick={() => append({})}
        >
          <PlusIcon className="h-4 w-4 stroke-2" />
          OR
        </Button>
      </div>

      {/* Render the field array condition group */}
      <div className="mt-2 rounded-lg border bg-slate-50 px-5 pb-5 pt-2.5">
        <div className="mb-2 flex w-full items-center justify-between">
          <ConditionLabel
            label="Group 1"
            description="Group 1 description"
            className="text-[0.9rem]"
          />

          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="-mr-3 gap-1 text-xs text-primary hover:text-primary"
            onClick={() => append({})}
          >
            <PlusIcon className="h-4 w-4 stroke-2" />
            AND
          </Button>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <ConditionLabel
            label="First Value"
            description="The first value to compare in the condition. This can be a number, string, or variable."
          />
          <ConditionLabel
            label="Operator"
            description="The operator to use for comparison."
          />
          <ConditionLabel
            label="Second Value"
            description="The second value to compare in the condition. This can be a number, string, or variable."
          />
          <span className="w-8" />
        </div>

        {fields.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 space-y-1.5"
          >
            {field.conditionArraySchema?.map((subField) => (
              <RenderField
                key={subField.name}
                {...subField}
                name={`${field.name}.${index}.${subField.name}`}
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon8"
              onClick={() => remove(index)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
