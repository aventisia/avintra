/**
 * Impact scale for a risk register row.
 */
export enum RiskImpact {
  Negligible = "negligible",
  Minor = "minor",
  Moderate = "moderate",
  Major = "major",
  Severe = "severe",
}

export const RISK_IMPACT_ORDER: Record<RiskImpact, number> = {
  [RiskImpact.Negligible]: 1,
  [RiskImpact.Minor]: 2,
  [RiskImpact.Moderate]: 3,
  [RiskImpact.Major]: 4,
  [RiskImpact.Severe]: 5,
};
