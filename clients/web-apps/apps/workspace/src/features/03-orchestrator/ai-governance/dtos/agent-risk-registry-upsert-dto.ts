import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { AgentRiskIssueDto } from "./agent-risk-issue-dto";
import { AiModelDto } from "./ai-model-dto";
import { ApprovalStateDto } from "./approval-state-dto";
import { RiskRegisterRowDto } from "./risk-register-row-dto";
import { ThirdPartyToolDto } from "./third-party-tool-dto";

/**
 * Upsert payload for the agent risk registry.
 * Human-input fields only - the backend resolves and persists the model/tool
 * dependency lists at save-time.
 */
export interface AgentRiskRegistryUpsertDto {
  /** The flow version (agent) id. */
  flowVersionId: string;
  /** The flow (agent) id. */
  flowId: string;
  /** Whether the agent is customer/consumer-facing. */
  isConsumerFacing: boolean;
  /** Intended use / business purpose. */
  intendedUse: string;
  /** Business processes affected. */
  businessProcesses: string;
  /** Scope / autonomy sub-score (1-5). */
  scopeScore: number;
  /** Data sensitivity sub-score (1-5). */
  dataSensitivityScore: number;
  /** Dependency complexity sub-score (1-5). */
  dependencyComplexityScore: number;
  /** Supervisory impact sub-score (1-5). */
  supervisoryImpactScore: number;
  /** Tier justification. */
  tierJustification: string;
  /** Lifecycle status. */
  status: RiskLifecycleStatus;
  /** Last validation date. */
  lastValidationDate: string;
  /** Next review date. */
  nextReviewDate: string;
  /** Validator user id. */
  validatorUserId: string;
  /** Risk register rows. */
  risks: RiskRegisterRowDto[];
  /** AI models used (human-input overrides merged with resolved list). */
  aiModels: AiModelDto[];
  /** Third-party tools used (human-input overrides merged with resolved list). */
  thirdPartyTools: ThirdPartyToolDto[];
  /** Approval workflow state. */
  approval: ApprovalStateDto;
  /** Manually recorded issues / violations. */
  issues: AgentRiskIssueDto[];
}
