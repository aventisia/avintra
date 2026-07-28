import { Button } from "@avplatform/ui/buttons";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  ConditionLabel,
  ConditionListField,
  DCPFieldSchemaType,
  defaultConditionObj,
} from "../..";

export const ConditionGroupsField = (field: DCPFieldSchemaType) => {
  const { control } = useFormContext();

  // Top-level: groups of condition arrays
  const {
    fields: conditionGroups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: field.name,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <ConditionLabel
          label={field.label}
          description={field.description}
          className="text-base"
        />

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => appendGroup([[defaultConditionObj]])}
          className="gap-1 text-xs text-primary hover:text-primary"
        >
          <PlusIcon className="h-4 w-4 stroke-2" />
          OR
        </Button>
      </div>

      {conditionGroups.map((group, groupIndex) => {
        const groupName = `${field.name}.${groupIndex}`;
        return (
          <ConditionListField
            groupName={groupName}
            groupIndex={groupIndex}
            groupsCount={conditionGroups.length}
            removeGroup={removeGroup}
            key={group.id}
            {...field}
          />
        );
      })}
    </div>
  );
};
