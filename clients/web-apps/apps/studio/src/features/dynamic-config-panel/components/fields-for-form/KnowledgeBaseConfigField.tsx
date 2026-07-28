import { SliderField } from "@/components/Slider/SliderField";

import { InputField, MultiSelectField, SelectField } from "@avplatform/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

import { getKnowledgeBaseSelectOptions } from "../../apis/knowledge-base-apis.ts";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";

interface KnowledgeBaseConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const KnowledgeBaseConfigField = ({ name }: KnowledgeBaseConfigFieldProps) => {
  // Set names for the fields
  const knowledgeBaseFieldName =
    `${name}.knowledgeBase` as FieldPath<FieldValues>;
  const numberOfChunksFieldName =
    `${name}.numberOfChunks` as FieldPath<FieldValues>;
  const retrievalTypeFieldName =
    `${name}.retrievalType` as FieldPath<FieldValues>;
  const sourceThresholdFieldName =
    `${name}.sourceThreshold` as FieldPath<FieldValues>;

  // Get the form context
  const { control, setValue, getValues } = useFormContext();

  const { data: kbOptionsData } = useQuery({
    queryKey: ["knowledge-base-options"],
    queryFn: getKnowledgeBaseSelectOptions,
    select: (response) => response?.data ?? [],
  });

  const knowledgeBaseSelectOptions = (kbOptionsData ?? []).map((option) => ({
    label: option.label,
    value: option.value,
    description: option.description,
  }));

  useEffect(() => {
    const currentValue = getValues(knowledgeBaseFieldName);

    if (Array.isArray(currentValue)) {
      return;
    }

    if (typeof currentValue === "string") {
      const normalizedValue = currentValue
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      setValue(knowledgeBaseFieldName, normalizedValue, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      return;
    }

    setValue(knowledgeBaseFieldName, [], {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [getValues, knowledgeBaseFieldName, setValue]);

  const { field: sourceThresholdField } = useController({
    name: sourceThresholdFieldName,
    control,
  });

  // Render the KnowledgeBaseConfigField component
  return (
    <GroupedFieldsWrapper groupName="Configure Knowledge Base">
      <MultiSelectField
        size="sm"
        name={knowledgeBaseFieldName}
        label="Knowledge Base(s)"
        placeholder="Select knowledge base(s)"
        selectOptions={knowledgeBaseSelectOptions}
      />

      <InputField
        name={numberOfChunksFieldName}
        type="number"
        label="Number Of Chunks"
        fieldSize="sm"
      />

      {/* TODO: Once we have different retrieval types, we can show this field and make it dynamic based on the retrieval type selected */}
      <div className="hidden grid-cols-2 gap-2">
        <SelectField
          size="sm"
          name={retrievalTypeFieldName}
          selectOptions={[
            {
              label: "Basic",
              value: "Basic",
              description: "",
            },
            {
              label: "Advance",
              value: "Advance",
              description: "",
            },
          ]}
          label="Retrieval Type"
        />
      </div>

      <Controller
        {...sourceThresholdField}
        render={({ field }) => (
          <SliderField
            label="Source Threshold"
            name={field.name}
            trackColor="bg-muted"
            min={0}
            max={1.0}
            step={0.1}
            className="resize-none text-sm"
          />
        )}
      />
    </GroupedFieldsWrapper>
  );
};

KnowledgeBaseConfigField.displayName = "KnowledgeBaseConfigField";

export { KnowledgeBaseConfigField, type KnowledgeBaseConfigFieldProps };
