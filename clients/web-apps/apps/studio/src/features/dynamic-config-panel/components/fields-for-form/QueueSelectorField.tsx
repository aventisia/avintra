import { BaseFieldProps } from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import {
  SearchableSelectField,
  SearchableSelectFieldProps,
} from "@/react-toolkit/ui/searchable-select/SearchableSelectField.tsx";
import { useCurrentFlowStore } from "@/stores/current-flow-store.ts";

import { getQueuesByAgent } from "../../apis/queues-apis.ts";
import { InputSchemaField, QueuesTableDto } from "../../dtos/queues-table-dto.ts";

interface QueueSelectorFieldProps extends SearchableSelectFieldProps, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}

const QueueSelectorField = ({ name, selectOptions, ...props }: QueueSelectorFieldProps) => {
  const mapQueuesToSelectOptions = (queues: QueuesTableDto[]): ISelectOption[] => {
    return queues.map((queue) => ({
      value: queue.name,
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

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { data, isLoading } = useQuery({
    queryKey: ["agent-queues", currentFlow.versionId],
    queryFn: () => getQueuesByAgent(currentFlow.versionId),
    select: (response) => response?.data,
    enabled: Boolean(currentFlow.versionId),
  });

  // Form context
  const { control, setValue, getValues } = useFormContext();

  // Controllers
  const { field: queueSelectField } = useController({ name, control });

  useEffect(() => {
    const values = getValues();
    const fieldExists = "WorkItemData" in values;
    if (queueSelectField.value && fieldExists) {
      const queueSchema = data?.find((item) => item.name == queueSelectField.value)?.inputSchema;

      if (queueSchema) {
        const sampleWorkItem = createExampleValueObjectFromSchema(queueSchema);
        setValue("WorkItemData", JSON.stringify(sampleWorkItem));
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
