import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";

import { ThirdPartyToolDto } from "../../dtos/third-party-tool-dto";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

/**
 * Section 05 - Third-Party Tools Used.
 * One row per third-party tool the agent depends on. Tool identity is resolved
 * from the flow config by the backend; due diligence, risks, and mitigations are human input.
 */
export const ThirdPartyToolsUsedSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  if (!assessment || !selectedAgentId) return null;

  const tools = assessment.thirdPartyTools;

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const updateRow = (index: number, patch: Partial<ThirdPartyToolDto>) => {
    const next = tools.map((row, i) => (i === index ? { ...row, ...patch } : row));
    update({ thirdPartyTools: next });
  };

  if (tools.length === 0) {
    return (
      <SectionLayout
        eyebrow="Section 05"
        title="Third-party tools used"
        description="Tools used by the agent, resolved automatically from the agent definition."
      >
        <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted-foreground">
          No third-party tools detected for this agent.
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout
      eyebrow="Section 05"
      title="Third-party tools used"
      description="Tools used by the agent, resolved automatically. Complete due diligence and record any risks and mitigations."
    >
      <div className="space-y-4">
        {tools.map((tool, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-line bg-sunken/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{tool.tool}</Badge>
              {tool.credentialName && (
                <span className="text-xs text-muted-foreground">· {tool.credentialName}</span>
              )}
              {tool.actions && (
                <span className="text-xs text-muted-foreground">· {tool.actions}</span>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={tool.isDueDiligenceCompleted}
                onCheckedChange={(checked) =>
                  updateRow(index, { isDueDiligenceCompleted: !!checked })
                }
              />
              Due diligence completed
            </label>

            <Field
              label="Due diligence status"
              info="Summarise the due-diligence performed on this tool, e.g. vendor assessment reviewed, data-handling confirmed, or contract terms verified."
            >
              <input
                className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm"
                placeholder="e.g. Vendor assessment reviewed"
                value={tool.dueDiligenceStatus}
                onChange={(e) => updateRow(index, { dueDiligenceStatus: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Risks"
                info="List the specific risks posed by this tool, such as unauthorised data access, supply-chain exposure, or unsupported actions."
              >
                <textarea
                  className="w-full rounded-lg border border-line bg-surface p-3 text-sm"
                  placeholder="Risks specific to this tool"
                  value={tool.risks}
                  onChange={(e) => updateRow(index, { risks: e.target.value })}
                />
              </Field>
              <Field
                label="Mitigations"
                info="Describe the controls in place to address the risks above, e.g. least-privilege credentials, audit logging, or action restrictions."
              >
                <textarea
                  className="w-full rounded-lg border border-line bg-surface p-3 text-sm"
                  placeholder="Mitigations for the above"
                  value={tool.mitigations}
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
