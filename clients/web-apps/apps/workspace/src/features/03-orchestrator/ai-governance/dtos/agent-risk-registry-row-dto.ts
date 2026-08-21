import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { AgentRiskTier } from "../enums/risk-tier-enum";

/**
 * A row in the Agent Risk Registry table.
 * Combines published-agent identity with the registry state.
 */
export interface AgentRiskRegistryRowDto {
  /** The flow version (agent) id. */
  flowVersionId: string;
  /** The flow (agent) id. */
  flowId: string;
  /** Agent name. */
  name: string;
  /** Agent type (Agent -> Automation Agent, ChatAgent -> Chat Agent). */
  agentType: string;
  /** Agent version number. */
  versionNumber: number;
  /** Date the agent was published. */
  publishedOn: string;
  /** Composite risk tier. */
  compositeTier: AgentRiskTier | null;
  /** Lifecycle status. */
  status: RiskLifecycleStatus;
  /** Number of open (unresolved) issues for this agent. */
  openIssues: number;
  /** Last validation date. */
  lastValidationDate: string;
  /** Next review date. */
  nextReviewDate: string;
}
