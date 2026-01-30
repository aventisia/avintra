import { Button } from "@aventisia/ui/buttons";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  DCPFieldSchemaType,
  defaultConditionObj,
  RenderField,
  shouldRenderField,
} from "../..";
import { FieldsLabelHeader } from "./FieldsLabelHeader";
import { GroupedFieldsWrapper } from "../fields-for-form/GroupedFieldsWrapper";

export const QueueConditionGroupsField = (field: DCPFieldSchemaType) => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  const rowValues = useWatch({
    name: field.name,
    control,
  });

    // const mapSchemaFieldsToSelectOptions = (
    //   fields: InputSchemaField[],
    // ): ISelectOption[] => {
    //   return fields.map((field) => ({
    //     value: field.name,
    //     label: field.label ?? field.name,
    //   }));
    // };
  

  return (
    <GroupedFieldsWrapper groupName="Configure Conditions">
      <div>
        <div className="mt-2 rounded-lg border bg-slate-50 px-5 pb-5 pt-2.5">
          <FieldsLabelHeader />

          {fields.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 space-y-1.5"
            >
              {field.conditionSchema?.map((subField) => {
                subField.disabled = !shouldRenderField(
                  "Input",
                  subField,
                  rowValues?.[index],
                );

                return (
                  <RenderField
                    key={subField.name}
                    {...subField}
                    name={`${field.name}.${index}.${subField.name}`}
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
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => append(defaultConditionObj)}
            className="gap-1 w-full mt-2 text-xs text-primary hover:text-primary"
          >
            <PlusIcon className="h-4 w-4 stroke-2" />
            AND
          </Button>
        </div>
      </div>
    </GroupedFieldsWrapper>
  );
};
