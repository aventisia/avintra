import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  ConditionLabel,
  DCPFieldSchemaType,
  FieldsLabelHeader,
  RenderField,
} from "../..";

export const ConditionArrayField = (field: DCPFieldSchemaType) => {
  const [fieldsCount, setFieldsCount] = useState(0);

  // Get the form context and field array methods
  const { control, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  // Ensure at least one entry exists
  useEffect(() => {
    const current = getValues(field.name);
    if (!current || current.length === 0) {
      append({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the fields count whenever fields change
  useEffect(() => {
    setFieldsCount(fields.length);
  }, [fields]);

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
          <ConditionLabel label="Group 1" className="text-[0.9rem]" />

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

        {/* Render the header for the fields in the condition group */}
        <FieldsLabelHeader fieldsCount={fieldsCount} />

        {/* Render the fields in the condition group */}
        {fields.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 space-y-1.5",
              fieldsCount > 1
                ? "grid-cols-[1fr_1fr_1fr_auto]"
                : "grid-cols-[1fr_1fr_1fr]",
            )}
          >
            {field.conditionArraySchema?.map((subField) => (
              <RenderField
                key={subField.name}
                {...subField}
                name={`${field.name}.${index}.${subField.name}`}
              />
            ))}
            {fieldsCount > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon8"
                onClick={() => remove(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
