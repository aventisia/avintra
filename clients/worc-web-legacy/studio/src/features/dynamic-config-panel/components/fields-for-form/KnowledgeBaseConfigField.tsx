import { SliderField } from "@/components/Slider/SliderField";

import { InputField, MultiSelectField, SelectField } from "@aventisia/ui/form";
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
    disabled: option.disabled,
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
        label="Knowledge Base"
        placeholder="Select knowledge base(s)"
        selectOptions={knowledgeBaseSelectOptions}
      />

      <div className="grid grid-cols-2 gap-2">
        <InputField
          name={numberOfChunksFieldName}
          type="number"
          label="Number Of Chunks"
          fieldSize="sm"
        />

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
            value={[field.value ?? 0.6]}
            onValueChange={(val) => field.onChange(val[0])}
            onValueCommit={field.onBlur}
            trackColor="bg-muted"
            min={0}
            max={1.2}
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
