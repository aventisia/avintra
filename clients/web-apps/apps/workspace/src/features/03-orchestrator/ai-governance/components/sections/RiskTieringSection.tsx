import { cn } from "@avplatform/ui/lib";

import {
  DATA_SENSITIVITY_SCORE_OPTIONS,
  DEPENDENCY_COMPLEXITY_SCORE_OPTIONS,
  SCOPE_SCORE_OPTIONS,
  SUPERVISORY_IMPACT_SCORE_OPTIONS,
} from "../../constants/dropdown-options";
import { AgentRiskTier } from "../../enums/risk-tier-enum";
import { useAiGovernanceStore, useSelectedAssessment } from "../../stores/ai-governance-store";
import { computeAgentRiskTier, getTierRationale } from "../../utils/tiering-engine";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Field } from "./Field";
import { SectionLayout } from "./SectionLayout";

const tierColor: Record<AgentRiskTier, string> = {
  [AgentRiskTier.Low]: "text-ok",
  [AgentRiskTier.Medium]: "text-warn",
  [AgentRiskTier.High]: "text-bad",
};

const scoreToValue = (score: number): string => (score === 0 ? "" : String(score));

/**
 * Section 02 - Agent Risk Tiering.
 * The composite tier is computed live via the MAX-based engine.
 */
export const RiskTieringSection = () => {
  const selectedAgentId = useAiGovernanceStore((state) => state.selectedAgentId);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessment = useSelectedAssessment();

  if (!assessment || !selectedAgentId) return null;

  const tier = computeAgentRiskTier({
    scopeScore: assessment.scopeScore,
    dataSensitivityScore: assessment.dataSensitivityScore,
    dependencyComplexityScore: assessment.dependencyComplexityScore,
    supervisoryImpactScore: assessment.supervisoryImpactScore,
  });

  const update = (patch: Partial<typeof assessment>) => {
    updateAssessment(selectedAgentId, { ...assessment, ...patch });
  };

  return (
    <SectionLayout
      eyebrow="Section 02"
      title="Agent risk tiering"
      description="The composite tier is the highest of the four sub-scores - a low score on one factor never dilutes a high score on another."
    >
      <div className="space-y-6">
        <Field
          label="Scope / autonomy"
          required
          hint="How autonomous is the agent in acting or deciding?"
          info="Score the degree of autonomy: 1 = advisory only, 3 = human-reviewed, 5 = fully autonomous. Higher autonomy carries higher risk."
        >
          <SegmentedControl
            variant="risk"
            options={SCOPE_SCORE_OPTIONS}
            value={scoreToValue(assessment.scopeScore) as never}
            onChange={(v) => update({ scopeScore: Number(v) })}
          />
        </Field>

        <Field
          label="Data sensitivity"
          required
          hint="How sensitive is the data the agent handles?"
          info="Score based on the highest class of data the agent processes: 1 = public, 3 = confidential, 5 = highly restricted / regulated."
        >
          <SegmentedControl
            variant="risk"
            options={DATA_SENSITIVITY_SCORE_OPTIONS}
            value={scoreToValue(assessment.dataSensitivityScore) as never}
            onChange={(v) => update({ dataSensitivityScore: Number(v) })}
          />
        </Field>

        <Field
          label="Dependency complexity"
          required
          hint="How many and how complex are the external dependencies?"
          info="Score based on the number and complexity of external models/tools the agent depends on: 1 = none, 3 = mixed, 5 = complex multi-vendor."
        >
          <SegmentedControl
            variant="risk"
            options={DEPENDENCY_COMPLEXITY_SCORE_OPTIONS}
            value={scoreToValue(assessment.dependencyComplexityScore) as never}
            onChange={(v) => update({ dependencyComplexityScore: Number(v) })}
          />
        </Field>

        <Field
          label="Supervisory / regulatory impact"
          required
          hint="How significant is the regulatory impact of failure?"
          info="Score the regulatory consequence if the agent fails: 1 = none, 3 = moderate, 5 = high regulatory impact."
        >
          <SegmentedControl
            variant="risk"
            options={SUPERVISORY_IMPACT_SCORE_OPTIONS}
            value={scoreToValue(assessment.supervisoryImpactScore) as never}
            onChange={(v) => update({ supervisoryImpactScore: Number(v) })}
          />
        </Field>

        {/* Composite tier panel */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Composite risk tier
          </div>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "text-[28px] font-extrabold",
                tier ? tierColor[tier] : "text-muted-foreground",
              )}
            >
              {tier ? tier.toUpperCase() : "-"}
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground">
              {getTierRationale(tier)}
            </div>
          </div>
        </div>

        <Field
          label="Tier justification (optional)"
          info="Optionally explain how the sub-scores were assigned, especially if the computed tier is adjusted or is being questioned."
        >
          <textarea
            className="w-full rounded-lg border border-border bg-background p-3 text-sm"
            placeholder="Explain the assigned sub-scores or any adjustment rationale."
            value={assessment.tierJustification}
            onChange={(e) => update({ tierJustification: e.target.value })}
          />
        </Field>
      </div>
    </SectionLayout>
  );
};
