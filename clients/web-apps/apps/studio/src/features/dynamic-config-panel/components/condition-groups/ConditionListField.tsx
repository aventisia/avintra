import { Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  ConditionLabel,
  DCPFieldSchemaType,
  FieldsLabelHeader,
  RenderField,
  defaultConditionObj,
  shouldRenderField,
} from "../..";

interface ConditionListFieldProps extends DCPFieldSchemaType {
  groupName: string; // group name for nested conditions
  groupIndex: number; // group index for nested conditions
  groupsCount: number; // Count of groups, if needed
  removeGroup: (index: number) => void; // Optional function to remove the group
}

export const ConditionListField = ({
  groupName,
  groupIndex,
  groupsCount,
  removeGroup,
  conditionSchema,
}: ConditionListFieldProps) => {
  // Get the form context and field array methods
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: groupName,
  });

  // Watch the values of the fields in the group
  const rowValues = useWatch({
    name: groupName,
    control,
  });

  return (
    <div className="mt-2 rounded-lg border bg-sunken px-5 pb-5 pt-2.5">
      <div className="mb-2 flex w-full items-center justify-between">
        <div className="flex items-center">
          <ConditionLabel label={`Group ${groupIndex + 1}`} className="text-[0.9rem]" />
          {groupsCount > 1 ? (
            <>
              <Separator orientation="vertical" className="ml-4 h-5" />
              <Button
                type="button"
                variant="caution"
                size="xs"
                disabled={groupsCount <= 1}
                onClick={() => removeGroup(groupIndex)}
                className="gap-1"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
                Remove
              </Button>
            </>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="-mr-3 gap-1 text-xs text-primary hover:text-primary"
          onClick={() => append(defaultConditionObj)}
        >
          <PlusIcon className="h-4 w-4 stroke-2" />
          AND
        </Button>
      </div>

      {/* Render the header for the fields in the condition group */}
      <FieldsLabelHeader />

      {/* Render the fields in the condition group */}
      {fields.map((item, index) => (
        <div
          key={item.id}
          className={cn("grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 space-y-1.5")}
        >
          {conditionSchema?.map((subField) => {
            // Check if the second value is reuqired based on the renderIf conditions
            subField.disabled = !shouldRenderField("Input", subField, rowValues[index]);

            // Render the sub-field
            return (
              <RenderField
                key={subField.name}
                {...subField}
                name={`${groupName}.${index}.${subField.name}`}
              />
            );
          })}
          <Button
            type="button"
            variant="caution"
            size="icon8"
            disabled={fields.length <= 1}
            onClick={() => remove(index)}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
