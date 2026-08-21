/**
 * Composite risk tier of an agent (computed, MAX of driving factors).
 */
export enum AgentRiskTier {
  Low = "low",
  Medium = "medium",
  High = "high",
}

/** Ordinal used by the tiering engine to compare levels. */
export const AGENT_RISK_TIER_ORDER: Record<AgentRiskTier, number> = {
  [AgentRiskTier.Low]: 1,
  [AgentRiskTier.Medium]: 2,
  [AgentRiskTier.High]: 3,
};
