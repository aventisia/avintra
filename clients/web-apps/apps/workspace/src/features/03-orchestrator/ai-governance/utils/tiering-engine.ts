import { RISK_IMPACT_ORDER, RiskImpact } from "../enums/risk-impact-enum";
import { RISK_LIKELIHOOD_ORDER, RiskLikelihood } from "../enums/risk-likelihood-enum";
import { RiskSeverity } from "../enums/risk-severity-enum";
import { AGENT_RISK_TIER_ORDER, AgentRiskTier } from "../enums/risk-tier-enum";

/**
 * Computes the composite agent risk tier from the four sub-scores.
 *
 * The composite is the MAX of the driving dimensions - a low score on one
 * factor must never dilute a high score on another (no averaging).
 *
 * @param scores - the four 1-5 sub-scores.
 * @returns the composite tier.
 */
export const computeAgentRiskTier = (scores: {
  scopeScore: number;
  dataSensitivityScore: number;
  dependencyComplexityScore: number;
  supervisoryImpactScore: number;
}): AgentRiskTier | null => {
  const { scopeScore, dataSensitivityScore, dependencyComplexityScore, supervisoryImpactScore } =
    scores;

  const maxScore = Math.max(
    scopeScore,
    dataSensitivityScore,
    dependencyComplexityScore,
    supervisoryImpactScore,
  );

  if (maxScore <= 0) return null;
  if (maxScore >= 4) return AgentRiskTier.High;
  if (maxScore >= 3) return AgentRiskTier.Medium;
  return AgentRiskTier.Low;
};

/**
 * One-line rationale for the computed tier.
 */
export const getTierRationale = (tier: AgentRiskTier | null): string => {
  switch (tier) {
    case AgentRiskTier.High:
      return "Requires elevated review and approval. Subject to enhanced monitoring.";
    case AgentRiskTier.Medium:
      return "Eligible for delegated review, subject to periodic reporting.";
    case AgentRiskTier.Low:
      return "Eligible for standard review.";
    default:
      return "Set the four sub-scores to calculate the composite tier.";
  }
};

/**
 * Computes the risk severity from likelihood x impact using a 5x5 matrix.
 * Score = likelihood(1-5) * impact(1-5); >=16 Critical, >=10 High, >=5 Medium, else Low.
 */
export const computeRiskSeverity = (
  likelihood: RiskLikelihood | null,
  impact: RiskImpact | null,
): RiskSeverity | null => {
  if (!likelihood || !impact) return null;

  const l = RISK_LIKELIHOOD_ORDER[likelihood];
  const i = RISK_IMPACT_ORDER[impact];

  const score = l * i;

  if (score >= 16) return RiskSeverity.Critical;
  if (score >= 10) return RiskSeverity.High;
  if (score >= 5) return RiskSeverity.Medium;
  return RiskSeverity.Low;
};

/** Ordinal helper for comparing risk severities. */
export const RISK_SEVERITY_ORDER: Record<RiskSeverity, number> = {
  [RiskSeverity.Low]: 1,
  [RiskSeverity.Medium]: 2,
  [RiskSeverity.High]: 3,
  [RiskSeverity.Critical]: 4,
};

export { AGENT_RISK_TIER_ORDER };
