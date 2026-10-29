import { Badge } from "@avplatform/ui/badge";
import { ISelectOption } from "@avplatform/ui/types";

import { MultiSelect } from "@/components/multi-select/MultiSelect";

import {
  MODEL_RISK_RATING_OPTIONS,
  MODEL_TYPE_OPTIONS,
  OUTPUT_CONSUMER_OPTIONS,
  SelectOption,
} from "../../constants/dropdown-options";
import { AiModelDto } from "../../dtos/ai-model-dto";
import { ModelType } from "../../enums/model-type-enum";
import { OutputConsumer } from "../../enums/output-consumer-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

const renderSelect = (value: string, options: SelectOption[], onChange: (v: string) => void) => (
  <select
    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

/** Maps a model type value to its display label. */
const modelTypeLabel = (type: ModelType | undefined): string =>
  MODEL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? "-";

const renderLinkedChips = (items: string[] | undefined) =>
  !items || items.length === 0 ? (
    <span className="text-xs text-muted-foreground">None</span>
  ) : (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="bg-muted/40">
          {item}
        </Badge>
      ))}
    </div>
  );

/**
 * Section 04 - AI Models Used.
 * One row per AI model the agent depends on. Model identity and per-node
 * context (node name, linked KBs/skills/tools) are resolved from the flow
 * config by the backend; risk rating, model type, output consumers, and
 * risks/mitigations are human input.
 */
export const AiModelsUsedSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  if (!assessment || !selectedAgentId) return null;

  const aiModels = assessment.aiModels;

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const updateRow = (index: number, patch: Partial<AiModelDto>) => {
    const next = aiModels.map((row, i) => (i === index ? { ...row, ...patch } : row));
    update({ aiModels: next });
  };

  if (aiModels.length === 0) {
    return (
      <SectionLayout
        eyebrow="Section 04"
        title="AI models used"
        description="Models used by the agent, resolved automatically from the agent definition."
      >
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No AI models detected for this agent.
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout
      eyebrow="Section 04"
      title="AI models used"
      description="Assess each model used by the agent for validation status, risks, and governance."
    >
      <div className="space-y-4">
        {aiModels.map((model, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{model.provider}</Badge>
              <span className="text-sm font-semibold">{model.model}</span>
              <span className="text-xs text-muted-foreground">· {model.credentialName}</span>
              {model.isByokEnabled && (
                <Badge variant="outline" className="bg-primary/10">
                  BYOK
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Node name" info="The flow node that uses this model.">
                <input
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={model.nodeName}
                  readOnly
                />
              </Field>
              <Field
                label="Model type"
                info="The type of the model, resolved from the agent definition: Conversation, Inferencing, or Generative."
              >
                <input
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={modelTypeLabel(model.modelType)}
                  readOnly
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Linked knowledge bases" info="Knowledge bases linked to this node.">
                {renderLinkedChips(model.linkedKnowledgeBases)}
              </Field>
              <Field label="Linked skills" info="Skills linked to this node.">
                {renderLinkedChips(model.linkedSkills)}
              </Field>
              <Field label="Linked tools" info="Tools linked to this node.">
                {renderLinkedChips(model.linkedTools)}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Risk rating"
                required
                info="Overall risk rating of this model for this agent's use case (Low, Medium, or High)."
              >
                {renderSelect(model.riskRating || "", MODEL_RISK_RATING_OPTIONS, (v) =>
                  updateRow(index, { riskRating: v }),
                )}
              </Field>
              <Field
                label="Output consumed by"
                info="Who consumes the output of this model (multi-select)."
              >
                <MultiSelect
                  value={model.outputConsumedBy ?? []}
                  onValueChange={(v) =>
                    updateRow(index, { outputConsumedBy: v as OutputConsumer[] })
                  }
                  options={OUTPUT_CONSUMER_OPTIONS as ISelectOption[]}
                  placeholder="Select consumers..."
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Monitoring plan"
                info="Describe ongoing monitoring for this model, e.g. drift/quality checks and frequency."
              >
                <textarea
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  placeholder="Monitoring plan (e.g. drift checks, frequency)"
                  value={model.monitoringPlan}
                  onChange={(e) => updateRow(index, { monitoringPlan: e.target.value })}
                />
              </Field>
              <Field
                label="Usage restrictions"
                info="Allowed use cases or guardrails for this model."
              >
                <textarea
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  placeholder="Usage restrictions / guardrails"
                  value={model.usageRestrictions}
                  onChange={(e) => updateRow(index, { usageRestrictions: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Risks"
                info="List the specific risks posed by this model, such as output variability, bias, hallucination risk, or data-privacy concerns."
              >
                <textarea
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  placeholder="Risks specific to this model"
                  value={model.risks}
                  onChange={(e) => updateRow(index, { risks: e.target.value })}
                />
              </Field>
              <Field
                label="Mitigations"
                info="Describe the controls in place to address the risks above, e.g. output verification, confidence thresholds, or periodic re-validation."
              >
                <textarea
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  placeholder="Mitigations for the above"
                  value={model.mitigations}
                  onChange={(e) => updateRow(index, { mitigations: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
};
