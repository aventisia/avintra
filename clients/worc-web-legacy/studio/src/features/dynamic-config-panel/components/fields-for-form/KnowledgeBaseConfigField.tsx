import { SliderField } from "@/components/Slider/SliderField";

import { InputField, SelectField } from "@aventisia/ui/form";
import {
  Controller,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

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
  const { control } = useFormContext();

  const { field: sourceThresholdField } = useController({
    name: sourceThresholdFieldName,
    control,
  });

  // Render the KnowledgeBaseConfigField component
  return (
    <GroupedFieldsWrapper groupName="Configure Knowledge Base">
      {/* <MultiSelectField
        size="sm"
        name={knowledgeBaseFieldName}
        label="Knowledge Base"
        selectOptions={[
          {
            label: "Knowledge Base 1",
            value: "Knowledge Base 1",
            description: "",
          },
          {
            label: "Knowledge Base 2",
            value: "Knowledge Base 2",
            description: "",
          },
        ]}
      /> */}
      <Controller
        name={knowledgeBaseFieldName}
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            fieldSize="sm"
            type="text"
            label="Knowledge Base"
            placeholder="Enter document names separated by comma (e.g., doc1, doc2, doc3)"
            value={field.value || ""}
            onChange={(e) => {
              field.onChange(e.target.value);
            }}
            onBlur={(e) => {
              const inputValue = e.target.value;
              const arrayValue = inputValue
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
              field.onChange(arrayValue);
            }}
          />
        )}
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
