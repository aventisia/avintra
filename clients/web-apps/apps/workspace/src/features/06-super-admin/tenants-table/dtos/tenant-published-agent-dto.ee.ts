/**
 * Represents a published agent (flow version) belonging to a specific tenant,
 * along with its usage metrics for the Super Admin tenants view.
 */
export interface TenantPublishedAgentDto {
  /** The flow version (agent) ID. */
  id: string;

  /** The flow ID the version belongs to. */
  refId: string;

  /** The name of the agent (flow). */
  name?: string | null;

  /** The version number of the flow version (agent). */
  versionNumber: number;

  /** The date and time when the agent was published. */
  publishedOn: Date | string;

  /** The daily average credits consumed by this agent within the last 30 days. */
  dailyAverageCredits: number;

  /** The daily average runtime (in seconds) of this agent within the last 30 days. */
  dailyAverageRuntime: number;

  /** The fixed credits limit configured for this agent, if any. */
  fixedCredits?: number | null;
}
