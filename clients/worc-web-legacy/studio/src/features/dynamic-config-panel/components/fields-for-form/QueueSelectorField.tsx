import { BaseFieldProps } from "@aventisia/ui/form";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import {
  SearchableSelectField,
  SearchableSelectFieldProps,
} from "@/react-toolkit/ui/searchable-select/SearchableSelectField.tsx";
import { ISelectOption } from "@aventisia/ui/types";
import { useQuery } from "@tanstack/react-query";
import { getQueues } from "../../apis/queues-apis.ts";
import {
  InputSchemaField,
  QueuesTableDto,
} from "../../dtos/queues-table-dto.ts";
import { useEffect } from "react";

interface QueueSelectorFieldProps
  extends SearchableSelectFieldProps,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;

  modelProvider?: string;
}

const QueueSelectorField = ({
  name,
  selectOptions,
  ...props
}: QueueSelectorFieldProps) => {
  const mapQueuesToSelectOptions = (
    queues: QueuesTableDto[],
  ): ISelectOption[] => {
    return queues.map((queue) => ({
      value: queue.id,
      label: queue.name,
    }));
  };

  type FieldExampleValue = string | number | null;

  const createExampleValueObjectFromSchema = (
    fields: InputSchemaField[],
  ): Record<string, FieldExampleValue> => {
    return fields.reduce<Record<string, FieldExampleValue>>((acc, field) => {
      switch (field.type) {
        case "string":
          acc[field.name] = "example text";
          break;
        case "int":
          acc[field.name] = 0;
          break;
        case "Date":
          acc[field.name] = new Date().toISOString();
          break;
      }
      return acc;
    }, {});
  };

  const { data, isLoading } = useQuery({
    queryKey: ["agent-queues"],
    queryFn: getQueues,
    select: (response) => response?.data,
  });

  // Form context
  const { control, setValue } = useFormContext();

  // Controllers
  const { field: queueSelectField } = useController({ name, control });

  useEffect(() => {
    if (queueSelectField.value) {
      const queueSchema = data?.find(
        (item) => item.id == queueSelectField.value,
      )?.inputSchema;

      if (queueSchema) {
        const sampleWorkItem = createExampleValueObjectFromSchema(queueSchema);
        setValue("CreateWorkItemData", JSON.stringify(sampleWorkItem));
      }
    }
  }, [queueSelectField.value]);
  return (
    <SearchableSelectField
      name={name}
      {...props}
      isLoading={isLoading}
      primaryText="Queues"
      selectOptions={mapQueuesToSelectOptions(data ?? []) ?? selectOptions}
    />
  );
};

QueueSelectorField.displayName = "QueueSelectorField";

export { QueueSelectorField };
