import { RiskCategory } from "../enums/risk-category-enum";
import { RiskImpact } from "../enums/risk-impact-enum";
import { RiskLikelihood } from "../enums/risk-likelihood-enum";
import { RiskSeverity } from "../enums/risk-severity-enum";

/**
 * A single risk register row - a specific risk and its mitigation.
 */
export interface RiskRegisterRowDto {
  /** Short risk name. */
  name: string;
  /** Risk category. */
  category: RiskCategory;
  /** Likelihood of occurrence. */
  likelihood: RiskLikelihood;
  /** Impact if it occurs. */
  impact: RiskImpact;
  /** Computed severity (derived from likelihood x impact). */
  severity: RiskSeverity;
  /** The mitigation plan. */
  mitigationPlan: string;
  /** Owner responsible for the mitigation. */
  owner: string;
  /** Status of the mitigation. */
  status: string;
}
