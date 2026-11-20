import { InputField } from "@avplatform/ui/form";
import { BookOpenTextIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";

import { getKnowledgeBaseSelectOptions } from "../../apis/knowledge-base-apis.ts";
import { useNormalizedIdList } from "../../hooks/useNormalizedIdList.hook";
import { ConfigFieldCard, ConfigFieldCount } from "./ConfigFieldCard";
import { ResourceListField } from "./ResourceListField";

interface KnowledgeBaseConfigFieldProps {
  /** The name of the form field. */
  name: string;
  /** Renders the body without its card, for a host that frames it. */
  hideGroup?: boolean;
}

const KnowledgeBaseConfigField = ({ name, hideGroup = false }: KnowledgeBaseConfigFieldProps) => {
  const knowledgeBaseFieldName = `${name}.knowledgeBase` as FieldPath<FieldValues>;
  const numberOfChunksFieldName = `${name}.numberOfChunks` as FieldPath<FieldValues>;
  const sourceThresholdFieldName = `${name}.sourceThreshold` as FieldPath<FieldValues>;

  const { control } = useFormContext();
  const attached = useWatch({ control, name: knowledgeBaseFieldName });
  const attachedCount = Array.isArray(attached) ? attached.length : 0;

  const { data: kbOptionsData, isLoading } = useQuery({
    queryKey: ["knowledge-base-options"],
    queryFn: getKnowledgeBaseSelectOptions,
    select: (response) => response?.data ?? [],
  });

  useNormalizedIdList(knowledgeBaseFieldName);

  const body = (
    <div className="space-y-3">
      <ResourceListField
        name={knowledgeBaseFieldName}
        options={kbOptionsData ?? []}
        isLoading={isLoading}
        Icon={BookOpenTextIcon}
        tone="sky"
        noun={["knowledge base", "knowledge bases"]}
        emptyHint="Nothing attached. The agent answers from its prompt alone."
      />

      <fieldset className="rounded-md bg-sunken/60 p-3">
        <legend className="float-left mb-2 w-full font-mono text-label uppercase text-muted-foreground">
          Retrieval
        </legend>
        <div className="clear-both grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <InputField
            name={numberOfChunksFieldName}
            type="number"
            label="Chunks per lookup"
            fieldSize="sm"
            min={1}
          />
          <SliderField
            label="Relevance threshold"
            name={sourceThresholdFieldName}
            trackColor="bg-muted"
            min={0}
            max={1.0}
            step={0.1}
            size="sm"
            formatValue={(value) => value.toFixed(1)}
          />
        </div>
        <p className="mt-2 text-hint text-muted-foreground">
          Passages scoring below the threshold are skipped.
        </p>
      </fieldset>
    </div>
  );

  if (hideGroup) return body;

  return (
    <ConfigFieldCard
      Icon={BookOpenTextIcon}
      tone="sky"
      label="Knows"
      title="Knowledge base"
      description="Documents the agent searches before it answers."
      aside={<ConfigFieldCount count={attachedCount} noun="attached" />}
    >
      {body}
    </ConfigFieldCard>
  );
};

KnowledgeBaseConfigField.displayName = "KnowledgeBaseConfigField";

export { KnowledgeBaseConfigField, type KnowledgeBaseConfigFieldProps };
