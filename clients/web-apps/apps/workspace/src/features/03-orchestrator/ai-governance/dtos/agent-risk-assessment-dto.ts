import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { AgentRiskTier } from "../enums/risk-tier-enum";
import { AgentRiskIssueDto } from "./agent-risk-issue-dto";
import { AiModelDto } from "./ai-model-dto";
import { ApprovalStateDto } from "./approval-state-dto";
import { RiskRegisterRowDto } from "./risk-register-row-dto";
import { ThirdPartyToolDto } from "./third-party-tool-dto";

/**
 * The full agent risk registry record for a single agent.
 * Identity/metadata and the resolved AI-model/tool lists are system-provided;
 * risk register rows and assessment inputs are human-entered.
 */
export interface AgentRiskAssessmentDto {
  /** Registry record id (empty until saved). */
  id: string;
  /** The flow version (agent) id. */
  flowVersionId: string;
  /** The flow (agent) id. */
  flowId: string;
  /** Agent name (system pre-filled). */
  agentName: string;
  /** Agent type (system pre-filled). */
  agentType: string;
  /** Agent version number (system pre-filled). */
  versionNumber: number;
  /** Date the agent was published (system pre-filled). */
  publishedOn: string;
  /** Whether the agent is customer/consumer-facing. */
  isConsumerFacing: boolean;
  /** Intended use / business purpose (human input). */
  intendedUse: string;
  /** Business processes affected (human input). */
  businessProcesses: string;

  // Agent risk tier (computed from human-entered sub-scores).
  scopeScore: number;
  dataSensitivityScore: number;
  dependencyComplexityScore: number;
  supervisoryImpactScore: number;
  compositeTier: AgentRiskTier | null;
  tierJustification: string;

  // Deployment & oversight.
  oversightModel: string;

  // Validation & approval (human input).
  status: RiskLifecycleStatus;
  lastValidationDate: string;
  nextReviewDate: string;
  validatorUserId: string;

  // Resolved dependencies (system pre-filled).
  aiModels: AiModelDto[];
  thirdPartyTools: ThirdPartyToolDto[];
  skills: string[];
  knowledgeBases: string[];

  // Risk register rows (human input).
  risks: RiskRegisterRowDto[];

  // Approval workflow state.
  approval: ApprovalStateDto;

  /** Whether the current user is the designated approver and may act on a pending submission. */
  canApprove: boolean;

  // Manually recorded issues / violations during execution.
  issues: AgentRiskIssueDto[];
}
