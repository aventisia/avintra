import { RiskSeverity } from "../enums/risk-severity-enum";

/**
 * An issue or violation raised against an agent, recorded manually during
 * execution monitoring. Issues are user-entered only (never auto-created).
 */
export interface AgentRiskIssueDto {
  /** Issue record id (empty until saved). */
  id: string;
  /** The registry record this issue belongs to. */
  agentRiskRegistryId: string;
  /** The flow version (agent) id. */
  flowVersionId: string;
  /** Optional reference to a prior execution (job) id. */
  jobId: string;
  /** Severity of the issue. */
  severity: RiskSeverity;
  /** Category of the issue. */
  category: string;
  /** Short title. */
  title: string;
  /** Detailed description. */
  description: string;
  /** When the issue was detected. */
  detectedOn: string;
  /** Status: open / investigating / resolved / wont-fix. */
  status: string;
  /** Notes from resolution. */
  resolutionNotes: string;
}
