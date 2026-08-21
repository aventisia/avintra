import { Button } from "@avplatform/ui/buttons";
import { FieldHelpPopover } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { PlusIcon, Trash2Icon } from "lucide-react";

import {
  MITIGATION_STATUS_OPTIONS,
  RISK_CATEGORY_OPTIONS,
  RISK_IMPACT_OPTIONS,
  RISK_LIKELIHOOD_OPTIONS,
  SelectOption,
} from "../../constants/dropdown-options";
import { RiskRegisterRowDto } from "../../dtos/risk-register-row-dto";
import { RiskCategory } from "../../enums/risk-category-enum";
import { RiskImpact } from "../../enums/risk-impact-enum";
import { RiskLikelihood } from "../../enums/risk-likelihood-enum";
import { RiskSeverity } from "../../enums/risk-severity-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { computeRiskSeverity } from "../../utils/tiering-engine";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

/**
 * A small field label with an optional "i" Markdown help popover.
 */
const InfoLabel = ({ children, info }: { children: React.ReactNode; info?: string }) => (
  <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
    {children}
    {info && <FieldHelpPopover content={info} />}
  </label>
);

const severityBadgeClass: Record<RiskSeverity, string> = {
  [RiskSeverity.Low]: "bg-emerald-500/15 text-emerald-600",
  [RiskSeverity.Medium]: "bg-amber-500/15 text-amber-600",
  [RiskSeverity.High]: "bg-red-500/15 text-red-600",
  [RiskSeverity.Critical]: "bg-red-600/20 text-red-700",
};

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

const createEmptyRow = (): RiskRegisterRowDto => ({
  name: "",
  category: RiskCategory.Data,
  likelihood: RiskLikelihood.Possible,
  impact: RiskImpact.Moderate,
  severity: RiskSeverity.Medium,
  mitigationPlan: "",
  owner: "",
  status: "",
});

/**
 * Section 03 - Risks & Mitigations.
 * A structured register of risks around the agent, each with a mitigation plan.
 */
export const RisksMitigationsSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  if (!assessment || !selectedAgentId) return null;

  const risks = assessment.risks;

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  const addRow = () => update({ risks: [...risks, createEmptyRow()] });

  const updateRow = (index: number, patch: Partial<RiskRegisterRowDto>) => {
    const next = risks.map((row, i) => {
      if (i !== index) return row;
      const merged = { ...row, ...patch };
      // Recompute severity from likelihood x impact.
      merged.severity =
        computeRiskSeverity(merged.likelihood, merged.impact) ?? RiskSeverity.Medium;
      return merged;
    });
    update({ risks: next });
  };

  const removeRow = (index: number) => update({ risks: risks.filter((_, i) => i !== index) });

  return (
    <SectionLayout
      eyebrow="Section 03"
      title="Risks & Mitigations"
      description="Capture the key risks around the agent and the mitigation plan for each. Severity is computed automatically from likelihood and impact."
    >
      <div className="space-y-3">
        {risks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No risks recorded yet. Add a risk to begin building the register.
          </div>
        )}

        {risks.map((row, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <input
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                placeholder="Risk name"
                value={row.name}
                onChange={(e) => updateRow(index, { name: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove risk"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <InfoLabel info="Pick the category that best describes the risk, e.g. Data, Model/Output, Compliance, Security, Operational, or Reputational.">
                  Category
                </InfoLabel>
                {renderSelect(row.category, RISK_CATEGORY_OPTIONS, (v) =>
                  updateRow(index, { category: v as RiskCategory }),
                )}
              </div>
              <div>
                <InfoLabel info="How likely is the risk to occur? Rare is very unlikely, Almost certain is expected in normal operation.">
                  Likelihood
                </InfoLabel>
                {renderSelect(row.likelihood, RISK_LIKELIHOOD_OPTIONS, (v) =>
                  updateRow(index, { likelihood: v as RiskLikelihood }),
                )}
              </div>
              <div>
                <InfoLabel info="If the risk occurs, how severe is the impact? Negligible is minor, Severe is significant harm or material loss.">
                  Impact
                </InfoLabel>
                {renderSelect(row.impact, RISK_IMPACT_OPTIONS, (v) =>
                  updateRow(index, { impact: v as RiskImpact }),
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  Severity (auto)
                </label>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                    severityBadgeClass[row.severity],
                  )}
                >
                  {row.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <InfoLabel info="The responsible person or role for this risk and its mitigation plan.">
                  Owner
                </InfoLabel>
                <input
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  placeholder="Owner"
                  value={row.owner}
                  onChange={(e) => updateRow(index, { owner: e.target.value })}
                />
              </div>
              <div>
                <InfoLabel info="Current state of the mitigation: Planned, In Progress, Implemented, or Monitored.">
                  Status
                </InfoLabel>
                {renderSelect(row.status, MITIGATION_STATUS_OPTIONS, (v) =>
                  updateRow(index, { status: v }),
                )}
              </div>
            </div>

            <Field
              label="Mitigation Plan"
              required
              info="Describe the concrete actions taken or planned to reduce the likelihood and/or impact of this risk."
            >
              <textarea
                className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                placeholder="Describe the mitigation plan for this risk."
                value={row.mitigationPlan}
                onChange={(e) => updateRow(index, { mitigationPlan: e.target.value })}
              />
            </Field>
          </div>
        ))}

        <Button variant="outline" onClick={addRow}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Risk
        </Button>
      </div>
    </SectionLayout>
  );
};
