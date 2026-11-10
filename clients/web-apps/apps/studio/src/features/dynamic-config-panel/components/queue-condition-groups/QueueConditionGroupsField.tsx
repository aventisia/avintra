import { Button } from "@avplatform/ui/buttons";
import { ISelectOption } from "@avplatform/ui/types";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useController, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { DCPFieldSchemaType, RenderField, shouldRenderField } from "../..";
import { getQueues } from "../../apis/queues-apis";
import { InputSchemaField } from "../../dtos/queues-table-dto";
import { GroupedFieldsWrapper } from "../fields-for-form/GroupedFieldsWrapper";
import { FieldsLabelHeader } from "./FieldsLabelHeader";

const defaultConditionObj = {
  Field: "",
  Operator: "EqualTo",
  Value: "",
  Id: crypto.randomUUID(), // Generate a unique ID for the new field
};

export const QueueConditionGroupsField = (field: DCPFieldSchemaType) => {
  const [queueFieldsOptions, setQueueFieldOptions] = useState<ISelectOption[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  const rowValues = useWatch({
    name: field.name,
    control,
  });

  const mapSchemaFieldsToSelectOptions = (fields: InputSchemaField[]): ISelectOption[] => {
    return fields.map((field) => ({
      value: field.name,
      label: field.label ?? field.name,
    }));
  };

  const { data } = useQuery({
    queryKey: ["agent-queues"],
    queryFn: getQueues,
    select: (response) => response?.data,
  });

  // Controllers
  const { field: queueSelectField } = useController({
    name: "QueueId",
    control,
  });

  const prevQueueRef = useRef(queueSelectField.value);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  //  Reset ONLY when queue actually changes
  useEffect(() => {
    if (!isInitialized) return;
    if (prevQueueRef.current === queueSelectField.value) return;

    prevQueueRef.current = queueSelectField.value;

    setValue(field.name, [defaultConditionObj], {
      shouldDirty: true,
    });
  }, [queueSelectField.value, isInitialized, setValue, field.name]);

  useEffect(() => {
    if (queueSelectField.value) {
      const queueSchema = data?.find((item) => item.name == queueSelectField.value)?.inputSchema;

      if (queueSchema) {
        setQueueFieldOptions(mapSchemaFieldsToSelectOptions(queueSchema));
      }
    }
  }, [queueSelectField.value, data]);

  return (
    <GroupedFieldsWrapper groupName="Configure conditions">
      <div className="mt-2 rounded-lg border bg-sunken px-5 pb-5 pt-2.5">
        <FieldsLabelHeader />

        {fields.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3 space-y-1.5"
          >
            {field.conditionSchema?.map((subField, i) => {
              subField.disabled = !shouldRenderField("Input", subField, rowValues?.[index]);

              return (
                <RenderField
                  key={subField.name}
                  {...subField}
                  name={`${field.name}.${index}.${subField.name}`}
                  selectOptions={i === 0 ? queueFieldsOptions : subField.selectOptions}
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
          className="mt-2 w-full gap-1 text-xs"
        >
          <PlusIcon className="h-4 w-4" />
          Add condition
        </Button>
      </div>
    </GroupedFieldsWrapper>
  );
};
