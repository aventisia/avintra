import { Input } from "@avplatform/ui";
import { Textarea } from "@avplatform/ui";

import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

/**
 * Section 01 - Agent Identity & Classification.
 * Identity/metadata is system pre-filled; intended use, business processes,
 * and consumer-facing flag are human input.
 */
export const AgentIdentitySection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  if (!assessment || !selectedAgentId) return null;

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const publishedDate = assessment.publishedOn
    ? new Date(assessment.publishedOn).toLocaleDateString()
    : "";

  return (
    <SectionLayout
      eyebrow="Section 01"
      title="Agent identity & classification"
      description="Baseline record for the agent being assessed."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Agent name" hint="Auto-filled from the agent definition.">
            <Input value={assessment.agentName} readOnly />
          </Field>
          <Field label="Agent type" hint="Auto-filled.">
            <Input value={assessment.agentType} readOnly />
          </Field>
          <Field label="Version" hint="Auto-filled.">
            <Input value={String(assessment.versionNumber)} readOnly />
          </Field>
          <Field label="Published on" hint="Auto-filled.">
            <Input value={publishedDate} readOnly />
          </Field>
          <Field label="Agent ID" hint="Auto-filled.">
            <Input value={assessment.flowVersionId} readOnly />
          </Field>
        </div>

        <Field
          label="Is this agent customer / consumer-facing?"
          info="Select Yes if the agent interacts directly with customers/consumers or handles their data. This informs the level of oversight expected."
        >
          <SegmentedControl
            options={[
              { value: "no", label: "No - internal" },
              { value: "yes", label: "Yes - customer-facing" },
            ]}
            value={assessment.isConsumerFacing ? "yes" : "no"}
            onChange={(v) => update({ isConsumerFacing: v === "yes" })}
          />
        </Field>

        <Field
          label="Intended use & business purpose"
          required
          info="Describe what decision or process this agent supports or automates, and its expected benefit. Be specific about the business outcome."
        >
          <Textarea
            placeholder="What decision or process does this agent support or automate?"
            value={assessment.intendedUse}
            onChange={(e) => update({ intendedUse: e.target.value })}
          />
        </Field>

        <Field
          label="Business processes affected"
          required
          info="List the business processes this agent touches, e.g. lending decisioning, customer onboarding, collections, or complaint triage. Separate multiple processes with commas."
        >
          <Textarea
            placeholder="e.g. Lending decisioning, customer onboarding, collections, complaint triage"
            value={assessment.businessProcesses}
            onChange={(e) => update({ businessProcesses: e.target.value })}
          />
        </Field>
      </div>
    </SectionLayout>
  );
};
