/**
 * Likelihood scale for a risk register row.
 */
export enum RiskLikelihood {
  Rare = "rare",
  Unlikely = "unlikely",
  Possible = "possible",
  Likely = "likely",
  AlmostCertain = "almost-certain",
}

export const RISK_LIKELIHOOD_ORDER: Record<RiskLikelihood, number> = {
  [RiskLikelihood.Rare]: 1,
  [RiskLikelihood.Unlikely]: 2,
  [RiskLikelihood.Possible]: 3,
  [RiskLikelihood.Likely]: 4,
  [RiskLikelihood.AlmostCertain]: 5,
};
