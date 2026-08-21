import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { ModelType } from "../enums/model-type-enum";
import { OutputConsumer } from "../enums/output-consumer-enum";
import { RiskCategory } from "../enums/risk-category-enum";
import { RiskImpact } from "../enums/risk-impact-enum";
import { RiskLikelihood } from "../enums/risk-likelihood-enum";

/** Select option shape. */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

/** Per-model risk rating dropdown options. */
export const MODEL_RISK_RATING_OPTIONS: SelectOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/** AI model type dropdown options. */
export const MODEL_TYPE_OPTIONS: SelectOption<ModelType>[] = [
  { value: ModelType.Conversation, label: "Conversation" },
  { value: ModelType.Inferencing, label: "Inferencing" },
  { value: ModelType.Generative, label: "Generative" },
];

/** Output consumer multi-select options. */
export const OUTPUT_CONSUMER_OPTIONS: SelectOption<OutputConsumer>[] = [
  { value: OutputConsumer.Employee, label: "Employee" },
  { value: OutputConsumer.Customer, label: "Customer" },
  { value: OutputConsumer.Vendor, label: "Vendor" },
  { value: OutputConsumer.Agent, label: "Agent" },
];

/** Risk category dropdown options. */
export const RISK_CATEGORY_OPTIONS: SelectOption<RiskCategory>[] = [
  { value: RiskCategory.Data, label: "Data" },
  { value: RiskCategory.ModelOutput, label: "Model / Output" },
  { value: RiskCategory.Compliance, label: "Compliance" },
  { value: RiskCategory.Security, label: "Security" },
  { value: RiskCategory.Operational, label: "Operational" },
  { value: RiskCategory.Reputational, label: "Reputational" },
];

/** Likelihood dropdown options. */
export const RISK_LIKELIHOOD_OPTIONS: SelectOption<RiskLikelihood>[] = [
  { value: RiskLikelihood.Rare, label: "Rare" },
  { value: RiskLikelihood.Unlikely, label: "Unlikely" },
  { value: RiskLikelihood.Possible, label: "Possible" },
  { value: RiskLikelihood.Likely, label: "Likely" },
  { value: RiskLikelihood.AlmostCertain, label: "Almost certain" },
];

/** Impact dropdown options. */
export const RISK_IMPACT_OPTIONS: SelectOption<RiskImpact>[] = [
  { value: RiskImpact.Negligible, label: "Negligible" },
  { value: RiskImpact.Minor, label: "Minor" },
  { value: RiskImpact.Moderate, label: "Moderate" },
  { value: RiskImpact.Major, label: "Major" },
  { value: RiskImpact.Severe, label: "Severe" },
];

/** Lifecycle status dropdown options. */
export const RISK_LIFECYCLE_STATUS_OPTIONS: SelectOption<RiskLifecycleStatus>[] = [
  { value: RiskLifecycleStatus.NotAssessed, label: "Not Assessed" },
  { value: RiskLifecycleStatus.InAssessment, label: "In Assessment" },
  { value: RiskLifecycleStatus.Submitted, label: "Submitted" },
  { value: RiskLifecycleStatus.InReview, label: "In Review" },
  { value: RiskLifecycleStatus.Approved, label: "Approved" },
  { value: RiskLifecycleStatus.ApprovedWithExceptions, label: "Approved with Exceptions" },
  { value: RiskLifecycleStatus.Monitored, label: "Monitored" },
  { value: RiskLifecycleStatus.ActionRequired, label: "Action Required" },
  { value: RiskLifecycleStatus.Retired, label: "Retired" },
];

/** Mitigation status options (for each risk register row). */
export const MITIGATION_STATUS_OPTIONS: SelectOption[] = [
  { value: "planned", label: "Planned" },
  { value: "in-progress", label: "In Progress" },
  { value: "implemented", label: "Implemented" },
  { value: "monitored", label: "Monitored" },
];

/** Agent scope / autonomy sub-score options (1-5). */
export const SCOPE_SCORE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - Advisory only" },
  { value: "2", label: "2 - Low autonomy" },
  { value: "3", label: "3 - Human-reviewed" },
  { value: "4", label: "4 - High autonomy" },
  { value: "5", label: "5 - Fully autonomous" },
];

/** Data sensitivity sub-score options (1-5). */
export const DATA_SENSITIVITY_SCORE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - Public" },
  { value: "2", label: "2 - Internal" },
  { value: "3", label: "3 - Confidential" },
  { value: "4", label: "4 - Sensitive" },
  { value: "5", label: "5 - Highly restricted" },
];

/** Dependency complexity sub-score options (1-5). */
export const DEPENDENCY_COMPLEXITY_SCORE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - No external dependencies" },
  { value: "2", label: "2 - Few internal deps" },
  { value: "3", label: "3 - Mixed internal/external" },
  { value: "4", label: "4 - Many third-party deps" },
  { value: "5", label: "5 - Complex multi-vendor" },
];

/** Supervisory / regulatory impact sub-score options (1-5). */
export const SUPERVISORY_IMPACT_SCORE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - No regulatory impact" },
  { value: "2", label: "2 - Minimal" },
  { value: "3", label: "3 - Moderate" },
  { value: "4", label: "4 - Significant" },
  { value: "5", label: "5 - High regulatory impact" },
];
